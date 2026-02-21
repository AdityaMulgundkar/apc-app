# GHL Voice AI API Notes

Base URL: `https://services.leadconnectorhq.com`
Auth: Bearer token (sub-account access token)
Version header: `Version: 2021-04-15`

---

## 1. List Agents

```
GET /voice-ai/agents?locationId={locationId}&page={page}&pageSize={pageSize}&query={query}
```

### Query Params

| Param      | Required | Type   | Default | Notes              |
|------------|----------|--------|---------|--------------------|
| locationId | yes      | string |         |                    |
| page       | no       | number | 1       | min 1, max 5000    |
| pageSize   | no       | number | 10      | min 1, max 50      |
| query      | no       | string |         | search filter      |

### Scope: `voice-ai-agents.readonly`

### Response (200)

Schema: `GetAgentsResponseDTO`

```json
{
  "total": 150,
  "page": 2,
  "pageSize": 10,
  "agents": [ /* array of full GetAgentResponseDTO objects (see below) */ ]
}
```

---

## 2. Get Agent

```
GET /voice-ai/agents/{agentId}?locationId={locationId}
```

### Path Params

| Param   | Required | Type   |
|---------|----------|--------|
| agentId | yes      | string |

### Query Params

| Param      | Required | Type   |
|------------|----------|--------|
| locationId | yes      | string |

### Scope: `voice-ai-agents.readonly`

### Response (200)

Schema: `GetAgentResponseDTO`

Key fields (from OpenAPI spec):

| Field                      | Type     | Description                                    |
|----------------------------|----------|------------------------------------------------|
| id                         | string   | Agent ID                                       |
| locationId                 | string   | Location ID                                    |
| agentName                  | string   | Display name (1-40 chars)                      |
| businessName               | string   | Business name                                  |
| welcomeMessage             | string   | Initial greeting (max 190 chars)               |
| **agentPrompt**            | string   | Custom instructions / behavior prompt          |
| voiceId                    | string   | Voice synthesis ID                             |
| language                   | string   | Language code (en-US, es, fr, de, etc.)        |
| patienceLevel              | string   | low / medium / high                            |
| maxCallDuration            | number   | Max call seconds (180-900)                     |
| sendUserIdleReminders      | boolean  | Auto reminders on silence                      |
| reminderAfterIdleTimeSeconds | number | Seconds before idle reminder (1-20)            |
| inboundNumber              | string?  | Phone number                                   |
| numberPoolId               | string?  | Number pool ID                                 |
| callEndWorkflowIds         | string[] | Workflow IDs triggered after call               |
| sendPostCallNotificationTo | object?  | Notification config (admins, allUsers, etc.)   |
| agentWorkingHours          | array    | Working hour intervals by day                  |
| timezone                   | string   | IANA timezone                                  |
| isAgentAsBackupDisabled    | boolean  | Excluded from backup scenarios                 |
| translation                | object?  | { enabled: boolean, language: string }         |
| actions                    | array    | Agent actions (call transfer, SMS, etc.)       |

Required fields: `id`, `locationId`, `agentName`, `businessName`, `welcomeMessage`, `agentPrompt`, `voiceId`, `language`, `patienceLevel`, `maxCallDuration`, `sendUserIdleReminders`, `reminderAfterIdleTimeSeconds`, `timezone`, `isAgentAsBackupDisabled`, `actions`

---

## 3. Patch Agent

```
PATCH /voice-ai/agents/{agentId}?locationId={locationId}
```

### Path Params

| Param   | Required | Type   |
|---------|----------|--------|
| agentId | yes      | string |

### Query Params

| Param      | Required | Type   |
|------------|----------|--------|
| locationId | yes      | string |

### Scope: `voice-ai-agents.write`

### Request Body

Schema: `PatchAgentDTO` — same fields as create, all optional. We primarily use:

```json
{
  "agentPrompt": "Updated prompt text here"
}
```

### Response (200)

Schema: `PatchAgentResponseDTO` — same shape as `GetAgentResponseDTO` (returns the updated agent)

---

## Error Responses

All endpoints return these on failure:

| Status | Description          |
|--------|----------------------|
| 400    | Bad Request          |
| 401    | Unauthorized         |
| 422    | Unprocessable Entity |
