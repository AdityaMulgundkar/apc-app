import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { logger } from '../utils/logger';
import { TestGenerationResultSchema, TestGenerationResult, TestCase } from '../types/testCase';
import { SimulationResultSchema, SimulationResult, TestResultSchema, TestResult } from '../types/evaluation';
import { OptimizationResultSchema, OptimizationResult } from '../types/optimization';
import { AgentAction } from '../types/agent';
import { SimulationV2Result } from '../types/simulation';
import { ConversationSimulator } from './conversationSimulator';

const loadPrompt = (name: string): string =>
  readFileSync(resolve(__dirname, `../prompts/${name}.md`), 'utf-8');

export type LlmModelFactory = () => ChatAnthropic;

export class LlmService {
  private generatePromptTemplate: string;
  private simulatePromptTemplate: string;
  private evaluatePromptTemplate: string;
  private optimizePromptTemplate: string;
  private conversationSimulator: ConversationSimulator;
  private createModel: LlmModelFactory;

  constructor(conversationSimulator: ConversationSimulator, createModel: LlmModelFactory) {
    this.generatePromptTemplate = loadPrompt('generate');
    this.simulatePromptTemplate = loadPrompt('simulate');
    this.evaluatePromptTemplate = loadPrompt('evaluate');
    this.optimizePromptTemplate = loadPrompt('optimize');
    this.conversationSimulator = conversationSimulator;
    this.createModel = createModel;
  }

  async generateTestCases(agentPrompt: string, actions?: AgentAction[], count: number = 5): Promise<TestGenerationResult> {
    logger.info({ requestedCount: count }, 'Generating test cases');
    const prompt = ChatPromptTemplate.fromTemplate(this.generatePromptTemplate);
    const model = this.createModel().withStructuredOutput(TestGenerationResultSchema);
    const chain = prompt.pipe(model);

    const availableTools = actions?.length
      ? actions.map((a) => {
          const desc = (a.actionParameters as Record<string, unknown>)?.description || '';
          return `- ${a.name} (${a.actionType.replace(/_/g, ' ')}): ${desc}`;
        }).join('\n')
      : 'No tools configured for this agent.';

    const result = await chain.invoke({ agentPrompt, availableTools, testCount: String(count) });
    logger.info({ count: result.testCases.length }, 'Test cases generated');
    return result;
  }

  async simulateConversation(agentPrompt: string, testCase: TestCase, actions?: AgentAction[]): Promise<SimulationResult> {
    logger.info({ testCaseId: testCase.id }, 'Simulating conversation');
    const prompt = ChatPromptTemplate.fromTemplate(this.simulatePromptTemplate);
    const model = this.createModel().withStructuredOutput(SimulationResultSchema);
    const chain = prompt.pipe(model);

    const availableTools = actions?.length
      ? actions.map((a) => {
          const desc = (a.actionParameters as Record<string, unknown>)?.description || '';
          return `- ${a.name} (${a.actionType.replace(/_/g, ' ')}): ${desc}`;
        }).join('\n')
      : 'No tools configured for this agent.';

    return chain.invoke({
      agentPrompt,
      availableTools,
      scenario: testCase.scenario,
      callerPersona: testCase.callerPersona,
      callerGoal: testCase.callerGoal,
      testCaseId: testCase.id,
    });
  }

  async simulateConversationV2(
    agentPrompt: string,
    testCase: TestCase,
    actions: AgentAction[] = [],
    welcomeMessage?: string,
  ): Promise<SimulationV2Result> {
    logger.info({ testCaseId: testCase.id }, 'Simulating conversation (v2 multi-turn)');
    return this.conversationSimulator.simulate(agentPrompt, testCase, actions, welcomeMessage);
  }

  async evaluateTranscript(
    agentPrompt: string,
    testCase: TestCase,
    simulation: SimulationResult,
    actions?: AgentAction[],
  ): Promise<TestResult> {
    logger.info({ testCaseId: testCase.id }, 'Evaluating transcript');
    const prompt = ChatPromptTemplate.fromTemplate(this.evaluatePromptTemplate);
    const model = this.createModel().withStructuredOutput(TestResultSchema);
    const chain = prompt.pipe(model);

    const successCriteria = testCase.successCriteria
      .map((sc) => `- [${sc.id}] (${sc.category}) ${sc.description}`)
      .join('\n');

    const transcript = simulation.transcript
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const availableTools = actions?.length
      ? actions.map((a) => {
          const desc = (a.actionParameters as Record<string, unknown>)?.description || '';
          return `- ${a.name} (${a.actionType.replace(/_/g, ' ')}): ${desc}`;
        }).join('\n')
      : 'No tools configured for this agent.';

    const toolCallLog = simulation.toolCallLog?.length
      ? simulation.toolCallLog
          .map((entry) => `Turn ${entry.turn}: Called "${entry.actionName}" (${entry.actionType}) with ${JSON.stringify(entry.params)} → ${JSON.stringify(entry.result)}`)
          .join('\n')
      : 'No tool calls were made during this conversation.';

    const result = await chain.invoke({
      agentPrompt,
      scenario: testCase.scenario,
      callerPersona: testCase.callerPersona,
      callerGoal: testCase.callerGoal,
      testCaseId: testCase.id,
      successCriteria,
      transcript,
      availableTools,
      toolCallLog,
    });

    const computedPass = result.criterionResults.every((cr) => cr.passed);
    logger.info({
      testCaseId: testCase.id,
      llmOverallPass: result.overallPass,
      computedOverallPass: computedPass,
      criteria: result.criterionResults.map((cr) => ({ id: cr.criterionId, passed: cr.passed })),
    }, 'Evaluation result');

    return {
      ...result,
      overallPass: computedPass,
    };
  }

  async optimizePrompt(agentPrompt: string, failures: TestResult[], actions?: AgentAction[]): Promise<OptimizationResult> {
    logger.info({ failureCount: failures.length }, 'Optimizing prompt');
    const prompt = ChatPromptTemplate.fromTemplate(this.optimizePromptTemplate);
    const model = this.createModel().withStructuredOutput(OptimizationResultSchema);
    const chain = prompt.pipe(model);

    const availableTools = actions?.length
      ? actions.map((a) => {
          const desc = (a.actionParameters as Record<string, unknown>)?.description || '';
          return `- ${a.name} (${a.actionType.replace(/_/g, ' ')}): ${desc}`;
        }).join('\n')
      : 'No tools configured for this agent.';

    const failuresText = failures
      .map((f) => {
        const failed = f.criterionResults.filter((cr) => !cr.passed);
        return `Test ${f.testCaseId}: ${f.summary}\nFailed criteria:\n${failed.map((cr) => `  - ${cr.criterionId}: ${cr.reasoning}`).join('\n')}`;
      })
      .join('\n\n');

    return chain.invoke({
      agentPrompt,
      availableTools,
      failures: failuresText,
    });
  }
}
