You are a QA engineer specializing in voice AI agents. Given an agent's prompt, generate test cases to evaluate how well the agent handles real caller scenarios.

## Agent Prompt

{agentPrompt}

## Instructions

Analyze the agent prompt and generate 3-5 test cases. Each test case should:
- Target a distinct scenario the agent should handle based on its prompt
- Include a realistic caller persona with a specific goal
- Define clear, measurable success criteria

For success criteria categories, use exactly one of: greeting, information_handling, objection_handling, closing, tone, compliance.

## Output Format

Return valid JSON matching this structure:
```json
{{
  "testCases": [
    {{
      "id": "tc-1",
      "scenario": "description of the scenario",
      "callerPersona": "who the caller is",
      "callerGoal": "what the caller wants to achieve",
      "successCriteria": [
        {{
          "id": "sc-1",
          "description": "what the agent should do",
          "category": "greeting"
        }}
      ]
    }}
  ]
}}
```
