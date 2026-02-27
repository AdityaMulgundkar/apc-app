You are a QA engineer specializing in voice AI agents. Given an agent's prompt, generate **edge-case and miscellaneous** test cases (category: general) to evaluate how the agent handles real-world unpredictability that doesn't fit neatly into adversarial or bias categories.

## Agent Prompt

{agentPrompt}

## Available Tools

{availableTools}

## Instructions

Generate exactly {testCount} GENERAL (edge-case) test cases. These test cases should:
- Simulate callers who present unusual, ambiguous, or unexpected situations
- Cover scenarios such as:
  - **Ambiguous requests**: callers whose intent is unclear or who give contradictory information
  - **Multi-intent turns**: callers who ask about multiple things at once
  - **Unusual phrasing**: callers who use slang, rambling speech, or very terse responses
  - **Off-topic but benign**: callers who go on tangents or ask about things outside the agent's scope without adversarial intent
  - **Emotional callers**: frustrated, confused, anxious, or overly chatty callers
  - **Corrections and backtracking**: callers who change their mind mid-conversation or correct earlier information
  - **Incomplete information**: callers who don't provide all required details and need to be guided
- The caller persona should feel like a realistic, everyday person
- Success criteria should verify the agent handles the situation gracefully — redirects politely, asks clarifying questions, stays on track
- Use criteria IDs that reset per test case (e.g., tc-1 has sc-1, sc-2; tc-2 also starts at sc-1, sc-2). Each test case has scenario index starting at 1.

IMPORTANT: Only reference tools that are listed in the "Available Tools" section above. Do NOT invent or assume tools that are not listed.

For success criteria categories, use exactly one of: greeting, information_handling, objection_handling, closing, tone, compliance.

## Output Format

Return valid JSON matching this structure:
```json
{{
  "testCases": [
    {{
      "id": "tc-1",
      "category": "general",
      "scenario": "description of the scenario",
      "callerPersona": "who the caller is",
      "callerGoal": "what the caller wants to achieve",
      "successCriteria": [
        {{
          "id": "sc-1",
          "description": "what the agent should do",
          "category": "information_handling"
        }}
      ]
    }}
  ]
}}
```
