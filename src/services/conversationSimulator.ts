import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { AgentAction } from '../types/agent';
import { TestCase } from '../types/testCase';
import { TranscriptMessage } from '../types/evaluation';
import { ToolExecutor, ToolCallLogEntry, SimulationV2Result } from '../types/simulation';

const MAX_TURNS = 12;

const GOODBYE_PATTERNS = [
  /\bgoodbye\b/i, /\bbye\b/i, /\bhave a (great|good|nice|pleasant) day\b/i,
  /\btake care\b/i, /\bthanks?,? (bye|goodbye)\b/i,
];

const loadPrompt = (name: string): string =>
  readFileSync(resolve(__dirname, `../prompts/${name}.md`), 'utf-8');

export type ModelFactory = (temperature: number) => ChatAnthropic;

export class ConversationSimulator {
  private toolExecutor: ToolExecutor;
  private callerPromptTemplate: string;
  private createModel: ModelFactory;

  constructor(toolExecutor: ToolExecutor, createModel: ModelFactory) {
    this.toolExecutor = toolExecutor;
    this.createModel = createModel;
    this.callerPromptTemplate = loadPrompt('caller');
  }

  async simulate(
    agentPrompt: string,
    testCase: TestCase,
    actions: AgentAction[] = [],
    welcomeMessage?: string,
  ): Promise<SimulationV2Result> {
    const transcript: TranscriptMessage[] = [];
    const toolCallLog: ToolCallLogEntry[] = [];
    let turnCount = 0;

    const { langchainTools, actionMap } = this.buildTools(actions, toolCallLog);

    const agentModel = this.createModel(0.3);

    const agentWithTools = langchainTools.length > 0
      ? agentModel.bindTools(langchainTools)
      : agentModel;

    const callerModel = this.createModel(0.5);

    const agentSystemPrompt = this.buildAgentSystemPrompt(agentPrompt, actions);
    const callerSystemPrompt = this.buildCallerSystemPrompt(testCase);

    const agentMessages: (SystemMessage | HumanMessage | AIMessage | ToolMessage)[] = [
      new SystemMessage(agentSystemPrompt),
    ];
    const callerMessages: (SystemMessage | HumanMessage | AIMessage)[] = [
      new SystemMessage(callerSystemPrompt),
    ];

    const greeting = welcomeMessage || 'Hello, thank you for calling. How can I help you today?';
    transcript.push({ role: 'agent', content: greeting });
    agentMessages.push(new AIMessage(greeting));
    callerMessages.push(new HumanMessage(greeting));

    logger.info({ testCaseId: testCase.id }, 'Starting multi-turn simulation');

    while (turnCount < MAX_TURNS) {
      turnCount++;

      const callerResponse = await callerModel.invoke(callerMessages);
      const callerText = typeof callerResponse.content === 'string'
        ? callerResponse.content
        : (callerResponse.content as Array<{ type: string; text?: string }>)
            .filter((b) => b.type === 'text')
            .map((b) => b.text)
            .join('');

      if (!callerText.trim()) {
        logger.info({ turn: turnCount }, 'Caller returned empty response, ending simulation');
        break;
      }

      transcript.push({ role: 'caller', content: callerText });
      callerMessages.push(new AIMessage(callerText));
      agentMessages.push(new HumanMessage(callerText));

      if (this.isGoodbye(callerText) && turnCount > 2) {
        logger.info({ turn: turnCount }, 'Caller said goodbye, ending simulation');
        break;
      }

      const agentResponse = await agentWithTools.invoke(agentMessages);
      agentMessages.push(agentResponse);

      let resolvedAgentText = '';

      if (agentResponse.tool_calls && agentResponse.tool_calls.length > 0) {
        for (const toolCall of agentResponse.tool_calls) {
          const action = actionMap.get(toolCall.name);
          if (action) {
            const result = await this.toolExecutor.execute(action, toolCall.args as Record<string, unknown>);
            toolCallLog.push({
              turn: turnCount,
              actionName: action.name,
              actionType: action.actionType,
              params: toolCall.args as Record<string, unknown>,
              result,
            });
            logger.info({ tool: action.name, turn: turnCount }, 'Tool call executed');

            const toolMessage = new ToolMessage({
              content: JSON.stringify(result.data),
              tool_call_id: toolCall.id!,
            });
            agentMessages.push(toolMessage);
          }
        }

        const followUp = await agentModel.invoke(agentMessages);
        agentMessages.push(followUp);
        resolvedAgentText = typeof followUp.content === 'string'
          ? followUp.content
          : (followUp.content as Array<{ type: string; text?: string }>)
              .filter((b) => b.type === 'text')
              .map((b) => b.text)
              .join('');
      } else {
        resolvedAgentText = typeof agentResponse.content === 'string'
          ? agentResponse.content
          : (agentResponse.content as Array<{ type: string; text?: string }>)
              .filter((b) => b.type === 'text')
              .map((b) => b.text)
              .join('');
      }

      if (!resolvedAgentText.trim()) {
        logger.info({ turn: turnCount }, 'Agent returned empty response, ending simulation');
        break;
      }

      transcript.push({ role: 'agent', content: resolvedAgentText });
      callerMessages.push(new HumanMessage(resolvedAgentText));

      if (this.isGoodbye(resolvedAgentText) && turnCount > 3) {
        logger.info({ turn: turnCount }, 'Agent said goodbye, ending simulation');
        break;
      }
    }

    logger.info({ testCaseId: testCase.id, turns: turnCount, toolCalls: toolCallLog.length }, 'Simulation complete');

    const cleanedTranscript = this.cleanTranscript(transcript);

    return {
      testCaseId: testCase.id,
      transcript: cleanedTranscript,
      toolCallLog,
    };
  }

  private buildTools(
    actions: AgentAction[],
    toolCallLog: ToolCallLogEntry[],
  ): { langchainTools: DynamicStructuredTool[]; actionMap: Map<string, AgentAction> } {
    const actionMap = new Map<string, AgentAction>();
    const langchainTools: DynamicStructuredTool[] = [];

    for (const action of actions) {
      const toolName = this.sanitizeToolName(action.name);
      actionMap.set(toolName, action);

      const description = (action.actionParameters as Record<string, unknown>)?.description as string
        || `Executes the ${action.name} action (${action.actionType})`;

      const tool = new DynamicStructuredTool({
        name: toolName,
        description,
        schema: z.object({
          input: z.string().optional().describe('Relevant data extracted from the conversation'),
        }),
        func: async () => {
          return `Tool "${action.name}" invoked successfully.`;
        },
      });

      langchainTools.push(tool);
    }

    return { langchainTools, actionMap };
  }

  private sanitizeToolName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  }

  private buildAgentSystemPrompt(agentPrompt: string, actions: AgentAction[]): string {
    let prompt = agentPrompt;

    if (actions.length > 0) {
      const toolList = actions.map((a) => {
        const desc = (a.actionParameters as Record<string, unknown>)?.description || '';
        return `- ${a.name} (${a.actionType}): ${desc}`;
      }).join('\n');

      prompt += `\n\nYou have the following tools available:\n${toolList}\n\nUse the appropriate tool when the caller's query matches a tool's purpose. After using a tool, incorporate the result naturally into your response.`;
    }

    return prompt;
  }

  private buildCallerSystemPrompt(testCase: TestCase): string {
    return this.callerPromptTemplate
      .replace('{callerPersona}', testCase.callerPersona)
      .replace('{callerGoal}', testCase.callerGoal);
  }

  private cleanTranscript(transcript: TranscriptMessage[]): TranscriptMessage[] {
    const systemTokens = /<<[A-Z_]+>>/g;
    const trailingSeparator = /\s*---\s*[\s\S]*$/;
    const bracketedMeta = /\*{0,2}\[(Farewell|Conversation\s*(concluded|Complete|ended)|Goal\s*(achieved|has been))[\s\S]*?\]\*{0,2}/gi;

    return transcript
      .map((msg) => {
        let content = msg.content;
        content = content.replace(systemTokens, '');
        content = content.replace(trailingSeparator, '');
        content = content.replace(bracketedMeta, '');
        content = content.replace(/\n{3,}/g, '\n\n').trim();
        return { ...msg, content };
      })
      .filter((msg) => msg.content.length > 0);
  }

  private isGoodbye(text: string): boolean {
    return GOODBYE_PATTERNS.some((p) => p.test(text));
  }
}
