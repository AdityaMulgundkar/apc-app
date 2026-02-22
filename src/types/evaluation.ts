import { z } from 'zod';

export const TranscriptMessageSchema = z.object({
  role: z.enum(['caller', 'agent']),
  content: z.string(),
});

export const ToolCallLogEntrySchema = z.object({
  turn: z.number(),
  actionName: z.string(),
  actionType: z.string(),
  params: z.record(z.string(), z.unknown()),
  result: z.object({
    success: z.boolean(),
    data: z.record(z.string(), z.unknown()),
  }),
});

export const SimulationResultSchema = z.object({
  testCaseId: z.string(),
  transcript: z.array(TranscriptMessageSchema),
  toolCallLog: z.array(ToolCallLogEntrySchema).optional(),
});

export const CriterionResultSchema = z.object({
  criterionId: z.string(),
  passed: z.boolean(),
  reasoning: z.string(),
});

export const TestResultSchema = z.object({
  testCaseId: z.string(),
  overallPass: z.boolean(),
  criterionResults: z.array(CriterionResultSchema),
  summary: z.string(),
});

export const EvaluationReportSchema = z.object({
  results: z.array(TestResultSchema),
  overallScore: z.number().min(0).max(100),
  passRate: z.number().min(0).max(100),
});

export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
export type CriterionResult = z.infer<typeof CriterionResultSchema>;
export type TestResult = z.infer<typeof TestResultSchema>;
export type EvaluationReport = z.infer<typeof EvaluationReportSchema>;
