# Agent Performance Copilot (APC) — Project Summary

## What it is
A web application that automates testing and prompt optimization for HighLevel (GHL) Voice AI agents. It acts as a "Validation Flywheel" — select an agent, auto-generate test cases, simulate conversations, evaluate against success criteria, optimize the prompt, and apply it back to the agent via API. Built as a GHL marketplace app (Custom Page in an iframe).

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: Vue 3, Pinia (state management), Vite (build)
- **UI**: DaisyUI v4, Tailwind CSS v3
- **LLM**: LangChain, Anthropic Claude (claude-haiku-4-5)
- **Validation**: Zod (structured LLM outputs)
- **Logging**: Pino
- **Deployment**: Render (https://apc-app.onrender.com/)

## Architecture

### Backend (`src/`)
- Service-layer architecture: Routes → Services → Providers → External APIs
- All services use constructor injection for testability
- Key services:
  - `agentService.ts` — wraps GHL API for Voice AI agent CRUD
  - `llmService.ts` — 4-step prompt chain (generate, simulate, evaluate, optimize) via LangChain
  - `conversationSimulator.ts` — multi-turn conversation between two LLM instances (agent + caller), with tool calling support
  - `mockToolExecutor.ts` — returns realistic fake data for agent actions (booking, CRM updates, SMS, etc.)
- Providers:
  - `ghlAuth.ts` — OAuth token exchange, refresh, storage
  - `ghlProvider.ts` — authenticated GHL API calls
- Routes:
  - `GET /api/agents` — list agents
  - `GET /api/agents/:id` — get agent details
  - `POST /api/agents/:id/test` — generate test cases
  - `POST /api/agents/:id/run` — run tests (simulate + evaluate)
  - `POST /api/agents/:id/optimize` — generate optimized prompt
  - `PATCH /api/agents/:id/apply` — push new prompt to GHL
- Prompt templates in `src/prompts/` (Markdown files): `generate.md`, `caller.md`, `evaluate.md`, `optimize.md`, `simulate.md`
- Middleware: auth (locationId extraction), error handler, request logger
- Config: centralized `config.ts` with env vars

### Frontend (`src/ui/src/`)
- Single-page wizard flow with 5 steps: Select, Test, Results, Optimize, Apply
- No Vue Router — step-based navigation via Pinia store
- **Props-driven architecture**: All view components receive data via props and emit events. Only `App.vue` connects to the Pinia store. This makes every component independently unit-testable.
- State management: `copilotStore.js` (Pinia) — agents, prompts, test cases, results, optimization, wizard step, loading/error states, baseline tracking
- API layer: `copilotClient.js` — calls backend routes

### Components
- Layout: `App.vue` (wiring layer), `AppLayout.vue` (shell with collapsible sidebar)
- Views: `AgentSelector.vue`, `TestCaseDetail.vue`, `ConversationView.vue`, `OptimizationView.vue`, `ApplyView.vue`
- Lists: `TestCaseList.vue`, `TestResultsList.vue`
- Shared: `AppButton.vue`, `AppDropdown.vue`, `StatusBadge.vue`, `ResultIcon.vue`, `EmptyState.vue`

## 4-Step Prompt Chain
1. **Generate** — analyze agent prompt + available tools → produce test scenarios with success criteria (configurable count 1-20)
2. **Simulate** — two LLM instances (agent with real prompt + tool bindings, caller with persona/goal from test case) have a multi-turn conversation. Agent can invoke tools mid-conversation; MockToolExecutor returns realistic results. Ends on goodbye, empty response, or 12-turn limit. Transcript cleaned of LLM meta-commentary.
3. **Evaluate** — judge transcript against each success criterion → per-criterion pass/fail with reasoning. `overallPass` is deterministically computed (all criteria must pass), overriding LLM's judgment.
4. **Optimize** — take failures + original prompt → rewrite prompt to fix issues while preserving working behavior. Returns changes summary, issue/fix pairs, and the optimized prompt.

## Key Features
- Configurable test count (1-20)
- Run tests individually or in batch
- Re-run only failed tests after optimization
- Baseline tracking: each test's first-ever result is locked and never overwritten, enabling accurate "before vs. after" comparison
- Side-by-side prompt diff with synced scrolling (on both Optimize and Apply pages)
- Iterative optimization loop: optimize multiple times, re-run, track improvement
- "Apply to Agent" pushes optimized prompt back to GHL via PATCH API
- Dev mode: copy credentials from deployed GHL instance to develop locally without ngrok

## What's Real vs. Mocked
- **Real**: GHL API calls (list/get/patch agents), all LLM calls (generation, simulation, evaluation, optimization), prompt patching back to GHL
- **Mocked**: Conversation simulation (two LLMs instead of real Voice AI telephony), tool execution (MockToolExecutor returns fake data)

## Testability
- **Backend**: All services and providers use constructor injection (model factories, HTTP clients, config objects injected via constructor). Routes and middleware use factory functions.
- **Frontend**: All view and shared components are props-driven with no direct store access. Only `App.vue` touches the Pinia store.
- No test suites written (time-boxed assignment), but the architecture supports unit testing throughout.

## File Structure
```
src/
  index.ts              — Express app setup, DI wiring
  config.ts             — centralized env vars
  model.ts              — in-memory token storage
  routes/
    auth.ts             — OAuth routes
    copilot.ts          — copilot API routes
  services/
    agentService.ts     — GHL agent CRUD
    llmService.ts       — 4-step LLM chain
    conversationSimulator.ts — multi-turn simulation
    mockToolExecutor.ts — fake tool responses
  providers/
    ghlAuth.ts          — OAuth token management
    ghlProvider.ts      — authenticated GHL API
  middleware/
    auth.ts, errorHandler.ts, requestLogger.ts
  prompts/
    generate.md, caller.md, evaluate.md, optimize.md, simulate.md
  types/
    agent.ts, testCase.ts, evaluation.ts, optimization.ts, simulation.ts
  utils/
    logger.ts, sso.ts
  ui/src/
    App.vue             — root wiring layer
    main.js             — Vue app entry
    index.css           — global styles
    api/copilotClient.js
    stores/copilotStore.js
    components/         — all Vue components listed above
docs/
  architecture.md       — detailed technical architecture
README.md               — submission README
```

## GHL Integration
- OAuth scopes: `voice-ai-agents.readonly`, `voice-ai-agents.write`
- API version header: `Version: 2021-04-15`
- Custom Page module (iframe loads Vue app)
- Deployed on Render, marketplace app install URL available
