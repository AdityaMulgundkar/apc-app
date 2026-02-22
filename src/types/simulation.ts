import { AgentAction } from './agent';
import { TranscriptMessage } from './evaluation';

export interface ToolResult {
  success: boolean;
  data: Record<string, unknown>;
}

export interface ToolCallLogEntry {
  turn: number;
  actionName: string;
  actionType: string;
  params: Record<string, unknown>;
  result: ToolResult;
}

export interface ToolExecutor {
  execute(action: AgentAction, params: Record<string, unknown>): Promise<ToolResult>;
}

export interface SimulationV2Result {
  testCaseId: string;
  transcript: TranscriptMessage[];
  toolCallLog: ToolCallLogEntry[];
}
