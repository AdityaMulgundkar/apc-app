You are simulating a phone conversation between a caller and a voice AI agent. You play BOTH roles.

## Agent Prompt

{agentPrompt}

## Test Case

Scenario: {scenario}
Caller Persona: {callerPersona}
Caller Goal: {callerGoal}

## Instructions

Simulate a realistic phone conversation (8-15 turns). The agent should behave exactly as described in its prompt. The caller should act according to their persona and goal, including realistic behaviors like hesitation, follow-up questions, or pushback.

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
