import { z } from 'zod';

export const OptimizationResultSchema = z.object({
  optimizedPrompt: z.string(),
  changesSummary: z.string(),
  changes: z.array(
    z.object({
      issue: z.string(),
      fix: z.string(),
    })
  ),
});

export type OptimizationResult = z.infer<typeof OptimizationResultSchema>;
