import { Router, Request, Response } from 'express';
import { AgentService } from '../services/agentService';
import { LlmService } from '../services/llmService';
import { logger } from '../utils/logger';

export const createCopilotRouter = (agentService: AgentService, llmService: LlmService): Router => {
  const router = Router();

  router.get('/agents', async (req: Request, res: Response) => {
    try {
      const data = await agentService.listAgents(req.locationId!);
      res.json(data);
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to list agents');
      res.status(500).json({ error: error?.response?.data || error.message });
    }
  });

  router.get('/agents/:id', async (req: Request, res: Response) => {
    try {
      const data = await agentService.getAgent(req.locationId!, req.params.id);
      res.json(data);
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to get agent');
      res.status(500).json({ error: error?.response?.data || error.message });
    }
  });

  router.post('/agents/:id/test', async (req: Request, res: Response) => {
    try {
      const prompt = req.body.prompt
        || await agentService.getAgentPrompt(req.locationId!, req.params.id);
      const result = await llmService.generateTestCases(prompt, req.body.actions);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to generate test cases');
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/agents/:id/run', async (req: Request, res: Response) => {
    try {
      const { testCases, actions } = req.body;
      if (!testCases?.length) {
        return res.status(400).json({ error: 'testCases required in request body' });
      }
      const prompt = req.body.prompt
        || await agentService.getAgentPrompt(req.locationId!, req.params.id);

      const results = [];
      for (const tc of testCases) {
        const simulation = actions?.length
          ? await llmService.simulateConversationV2(prompt, tc, actions)
          : await llmService.simulateConversation(prompt, tc);
        const evaluation = await llmService.evaluateTranscript(prompt, tc, simulation, actions);
        results.push({ simulation, evaluation });
      }

      const testResults = results.map((r) => r.evaluation);
      const passCount = testResults.filter((r) => r.overallPass).length;

      res.json({
        results,
        overallScore: Math.round((passCount / testResults.length) * 100),
        passRate: Math.round((passCount / testResults.length) * 100),
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to run tests');
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/agents/:id/optimize', async (req: Request, res: Response) => {
    try {
      const { failures, actions } = req.body;
      if (!failures?.length) {
        return res.status(400).json({ error: 'failures required in request body' });
      }
      const prompt = req.body.prompt
        || await agentService.getAgentPrompt(req.locationId!, req.params.id);
      const result = await llmService.optimizePrompt(prompt, failures, actions);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to optimize prompt');
      res.status(500).json({ error: error.message });
    }
  });

  router.patch('/agents/:id/apply', async (req: Request, res: Response) => {
    try {
      const { optimizedPrompt } = req.body;
      if (!optimizedPrompt) {
        return res.status(400).json({ error: 'optimizedPrompt required in request body' });
      }
      const updated = await agentService.updateAgentPrompt(req.locationId!, req.params.id, optimizedPrompt);
      res.json(updated);
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to apply prompt');
      res.status(500).json({ error: error?.response?.data || error.message });
    }
  });

  return router;
};
