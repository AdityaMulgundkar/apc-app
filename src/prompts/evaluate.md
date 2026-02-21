You are a QA evaluator reviewing a voice AI agent's performance in a simulated conversation. Judge the agent strictly against the success criteria.

## Agent Prompt

{agentPrompt}

## Test Case

Scenario: {scenario}
Caller Persona: {callerPersona}
Caller Goal: {callerGoal}

## Success Criteria

{successCriteria}

## Transcript

{transcript}

## Instructions

Evaluate the transcript against each success criterion. Be strict — the agent should follow its prompt precisely. For each criterion, determine pass/fail and provide brief reasoning.

Then calculate:
- overallPass: true only if ALL criteria pass
- summary: 1-2 sentence overall assessment

## Output Format

Return valid JSON matching this structure:
```json
{{
  "testCaseId": "{testCaseId}",
  "overallPass": false,
  "criterionResults": [
    {{
      "criterionId": "sc-1",
      "passed": true,
      "reasoning": "brief explanation"
    }}
  ],
  "summary": "overall assessment"
}}
```
