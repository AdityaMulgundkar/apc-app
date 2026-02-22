import { AgentAction } from '../types/agent';
import { ToolExecutor, ToolResult } from '../types/simulation';

export class MockToolExecutor implements ToolExecutor {
  async execute(action: AgentAction, params: Record<string, unknown>): Promise<ToolResult> {
    switch (action.actionType) {
      case 'IN_CALL_DATA_EXTRACTION':
      case 'DATA_EXTRACTION':
        return { success: true, data: { extracted: true, ...params } };

      case 'CUSTOM_ACTION':
        return {
          success: true,
          data: {
            status: 'resolved',
            message: `Action "${action.name}" completed successfully`,
            details: { referenceId: 'REF-' + Math.random().toString(36).slice(2, 8).toUpperCase() },
          },
        };

      case 'APPOINTMENT_BOOKING':
        return {
          success: true,
          data: {
            confirmed: true,
            datetime: new Date(Date.now() + 86400000).toISOString(),
            message: 'Appointment booked successfully',
          },
        };

      case 'CALL_TRANSFER':
        return { success: true, data: { transferred: true, destination: 'live agent' } };

      case 'SMS':
        return { success: true, data: { sent: true, message: 'SMS sent successfully' } };

      case 'WORKFLOW_TRIGGER':
        return { success: true, data: { triggered: true, workflowId: 'wf-mock' } };

      case 'KNOWLEDGE_BASE':
        return {
          success: true,
          data: {
            answer: 'Based on our records, the relevant information has been retrieved.',
            source: 'knowledge_base',
          },
        };

      default:
        return { success: true, data: { message: `Action "${action.name}" executed` } };
    }
  }
}
