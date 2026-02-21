import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { config } from '../config';
import { logger } from '../utils/logger';
import { TestGenerationResultSchema, TestGenerationResult, TestCase } from '../types/testCase';
import { SimulationResultSchema, SimulationResult, TestResultSchema, TestResult } from '../types/evaluation';
import { OptimizationResultSchema, OptimizationResult } from '../types/optimization';

const loadPrompt = (name: string): string =>
  readFileSync(resolve(__dirname, `../prompts/${name}.md`), 'utf-8');

const createModel = () =>
  new ChatAnthropic({
    model: config.anthropic.model,
    temperature: 0,
    anthropicApiKey: config.anthropic.apiKey,
  });

export class LlmService {
  private generatePromptTemplate: string;
  private simulatePromptTemplate: string;
  private evaluatePromptTemplate: string;
  private optimizePromptTemplate: string;

  constructor() {
    this.generatePromptTemplate = loadPrompt('generate');
    this.simulatePromptTemplate = loadPrompt('simulate');
    this.evaluatePromptTemplate = loadPrompt('evaluate');
    this.optimizePromptTemplate = loadPrompt('optimize');
  }

  async generateTestCases(agentPrompt: string): Promise<TestGenerationResult> {
    logger.info('Generating test cases');
    const prompt = ChatPromptTemplate.fromTemplate(this.generatePromptTemplate);
    const model = createModel().withStructuredOutput(TestGenerationResultSchema);
    const chain = prompt.pipe(model);
    const result = await chain.invoke({ agentPrompt });
    logger.info({ count: result.testCases.length }, 'Test cases generated');
    return result;
  }

  async simulateConversation(agentPrompt: string, testCase: TestCase): Promise<SimulationResult> {
    logger.info({ testCaseId: testCase.id }, 'Simulating conversation');
    const prompt = ChatPromptTemplate.fromTemplate(this.simulatePromptTemplate);
    const model = createModel().withStructuredOutput(SimulationResultSchema);
    const chain = prompt.pipe(model);
    return chain.invoke({
      agentPrompt,
      scenario: testCase.scenario,
      callerPersona: testCase.callerPersona,
      callerGoal: testCase.callerGoal,
      testCaseId: testCase.id,
    });
  }

  async evaluateTranscript(
    agentPrompt: string,
    testCase: TestCase,
    simulation: SimulationResult,
  ): Promise<TestResult> {
    logger.info({ testCaseId: testCase.id }, 'Evaluating transcript');
    const prompt = ChatPromptTemplate.fromTemplate(this.evaluatePromptTemplate);
    const model = createModel().withStructuredOutput(TestResultSchema);
    const chain = prompt.pipe(model);

    const successCriteria = testCase.successCriteria
      .map((sc) => `- [${sc.id}] (${sc.category}) ${sc.description}`)
      .join('\n');

    const transcript = simulation.transcript
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    return chain.invoke({
      agentPrompt,
      scenario: testCase.scenario,
      callerPersona: testCase.callerPersona,
      callerGoal: testCase.callerGoal,
      testCaseId: testCase.id,
      successCriteria,
      transcript,
    });
  }

  async optimizePrompt(agentPrompt: string, failures: TestResult[]): Promise<OptimizationResult> {
    logger.info({ failureCount: failures.length }, 'Optimizing prompt');
    const prompt = ChatPromptTemplate.fromTemplate(this.optimizePromptTemplate);
    const model = createModel().withStructuredOutput(OptimizationResultSchema);
    const chain = prompt.pipe(model);

    const failuresText = failures
      .map((f) => {
        const failed = f.criterionResults.filter((cr) => !cr.passed);
        return `Test ${f.testCaseId}: ${f.summary}\nFailed criteria:\n${failed.map((cr) => `  - ${cr.criterionId}: ${cr.reasoning}`).join('\n')}`;
      })
      .join('\n\n');

    return chain.invoke({
      agentPrompt,
      failures: failuresText,
    });
  }
}
