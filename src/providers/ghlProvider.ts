import { GhlAuth } from './ghlAuth';
import { AgentConfig, AgentListResponse, PatchAgentRequest } from '../types/agent';

const API_VERSION = '2021-04-15';

export class GhlProvider {
  constructor(private auth: GhlAuth) {}

  async listAgents(locationId: string): Promise<AgentListResponse> {
    const axios = this.auth.createAuthenticatedAxios(locationId);
    const res = await axios.get(`/voice-ai/agents?locationId=${locationId}`, {
      headers: { Version: API_VERSION },
    });
    return res.data;
  }

  async getAgent(locationId: string, agentId: string): Promise<AgentConfig> {
    const axios = this.auth.createAuthenticatedAxios(locationId);
    const res = await axios.get(`/voice-ai/agents/${agentId}?locationId=${locationId}`, {
      headers: { Version: API_VERSION },
    });
    return res.data;
  }

  async patchAgent(locationId: string, agentId: string, body: PatchAgentRequest): Promise<AgentConfig> {
    const axios = this.auth.createAuthenticatedAxios(locationId);
    const res = await axios.patch(`/voice-ai/agents/${agentId}?locationId=${locationId}`, body, {
      headers: { Version: API_VERSION },
    });
    return res.data;
  }
}
