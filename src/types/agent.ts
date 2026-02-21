export interface AgentAction {
  id: string;
  actionType: string;
  name: string;
  actionParameters: Record<string, unknown>;
}

export interface AgentWorkingHour {
  dayOfTheWeek: number;
  intervals: { startHour: number; endHour: number; startMinute: number; endMinute: number }[];
}

export interface SendPostCallNotification {
  admins: boolean;
  allUsers: boolean;
  contactAssignedUser: boolean;
  specificUsers: string[];
  customEmails: string[];
}

export interface AgentConfig {
  id: string;
  locationId: string;
  agentName: string;
  businessName: string;
  welcomeMessage: string;
  agentPrompt: string;
  voiceId: string;
  language?: string;
  patienceLevel: string;
  maxCallDuration: number;
  sendUserIdleReminders: boolean;
  reminderAfterIdleTimeSeconds: number;
  inboundNumber?: string | null;
  inboundNumbers: string[];
  numberPoolId?: string | null;
  callEndWorkflowIds: string[];
  sendPostCallNotificationTo?: SendPostCallNotification;
  agentWorkingHours: AgentWorkingHour[];
  timezone: string;
  isAgentAsBackupDisabled: boolean;
  translation?: { enabled: boolean; language?: string };
  actions: AgentAction[];
  prompts?: Record<string, unknown>;
}

export interface AgentListResponse {
  agents: AgentConfig[];
  total: number;
  page: number;
  pageSize: number;
  traceId?: string;
}

export interface PatchAgentRequest {
  agentPrompt: string;
}
