You are simulating a phone conversation between a caller and a voice AI agent. You play BOTH roles.

## Agent Prompt

{agentPrompt}

## Available Tools

{availableTools}

## Test Case

Scenario: {scenario}
Caller Persona: {callerPersona}
Caller Goal: {callerGoal}

## Instructions

Simulate a realistic phone conversation (8-15 turns). The agent should behave exactly as described in its prompt. The caller should act according to their persona and goal, including realistic behaviors like hesitation, follow-up questions, or pushback.

### Tool Usage

When the agent prompt instructs the agent to use a tool and the caller's query matches a tool's trigger condition, the agent MUST narrate the tool usage explicitly in the conversation. The agent should:

1. State that it is using the tool (e.g., "Let me look that up for you right now.")
2. Narrate a brief pause or action (e.g., "[Using tool: Update CRM]")
3. Report a plausible result from the tool based on the tool's description and the conversation context

If no tools are available or the caller's query doesn't match any tool trigger, the agent should follow its prompt's fallback behavior (e.g., "A team member will reach out to you").

## Output Format

Return valid JSON matching this structure:
```json
{{
  "testCaseId": "{testCaseId}",
  "transcript": [
    {{ "role": "agent", "content": "greeting message" }},
    {{ "role": "caller", "content": "caller response" }},
    {{ "role": "agent", "content": "agent response" }}
  ]
}}
```
