You are a QA engineer specializing in voice AI agents. Given an agent's prompt, generate **cooperative / happy-path** test cases (category: blue) to evaluate how well the agent handles standard, expected caller interactions.

## Agent Prompt

{agentPrompt}

## Available Tools

{availableTools}

## Instructions

Generate exactly {testCount} BLUE (cooperative) test cases. These test cases should:
- Simulate callers who behave as expected and follow the normal conversation flow
- Cover standard use cases the agent is designed to handle (booking, inquiries, support, etc.)
- Verify correct greetings, accurate information delivery, proper tool usage, and professional closings
- Include a realistic caller persona with a specific, straightforward goal
- Define clear, measurable success criteria
- Use criteria IDs that reset per test case (e.g., tc-1 has sc-1, sc-2; tc-2 also starts at sc-1, sc-2). Each test case has scenario index starting at 1.

IMPORTANT: Only reference tools that are listed in the "Available Tools" section above. Do NOT invent or assume tools that are not listed. If a tool is listed, you may create test cases that verify the agent uses that specific tool correctly. If no tools are available, do not create test cases that expect tool usage.

For success criteria categories, use exactly one of: greeting, information_handling, objection_handling, closing, tone, compliance.

## Output Format

Return valid JSON matching this structure:
```json
{{
  "testCases": [
    {{
      "id": "tc-1",
      "category": "blue",
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
