import { z } from 'zod';

export const SuccessCriteriaSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: z.enum(['greeting', 'information_handling', 'objection_handling', 'closing', 'tone', 'compliance']),
});

export const TestCaseSchema = z.object({
  id: z.string(),
  scenario: z.string(),
  callerPersona: z.string(),
  callerGoal: z.string(),
  successCriteria: z.array(SuccessCriteriaSchema),
});

export const TestGenerationResultSchema = z.object({
  testCases: z.array(TestCaseSchema),
});

export type SuccessCriteria = z.infer<typeof SuccessCriteriaSchema>;
export type TestCase = z.infer<typeof TestCaseSchema>;
export type TestGenerationResult = z.infer<typeof TestGenerationResultSchema>;
