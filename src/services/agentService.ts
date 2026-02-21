import { GhlProvider } from '../providers/ghlProvider';
import { AgentConfig, AgentListResponse, PatchAgentRequest } from '../types/agent';

export class AgentService {
  constructor(private ghlProvider: GhlProvider) {}

  async listAgents(locationId: string): Promise<AgentListResponse> {
    return this.ghlProvider.listAgents(locationId);
  }

  async getAgent(locationId: string, agentId: string): Promise<AgentConfig> {
    return this.ghlProvider.getAgent(locationId, agentId);
  }

  async getAgentPrompt(locationId: string, agentId: string): Promise<string> {
    const agent = await this.getAgent(locationId, agentId);
    return agent.agentPrompt;
  }

  async updateAgentPrompt(locationId: string, agentId: string, newPrompt: string): Promise<AgentConfig> {
    const body: PatchAgentRequest = { agentPrompt: newPrompt };
    return this.ghlProvider.patchAgent(locationId, agentId, body);
  }
}
