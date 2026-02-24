# Agent Performance Copilot

<!-- TODO: 1-2 sentence elevator pitch -->

## What It Does

<!-- TODO: Brief description of the validation flywheel — test, evaluate, optimize, apply -->

## Setup & Installation

### Prerequisites

<!-- TODO: Node.js version, npm, Anthropic API key, GHL sandbox account -->

### Environment Variables

<!-- TODO: List all env vars from .env.example with descriptions -->

### Backend

<!-- TODO: npm install, npm run dev steps -->

### Frontend

<!-- TODO: cd src/ui, npm install, npm run build steps -->

### Running in GHL

<!-- TODO: How to set up Custom Page, OAuth scopes, deploy to Render or run locally with dev credentials -->

## How It Works

<!-- TODO: High-level flow (select agent → generate tests → run simulations → evaluate → optimize → apply). Link to docs/architecture.md for details -->

## Team of One

<!-- TODO: Narrative on owning all four roles -->

### Product

<!-- TODO: How product decisions were made — wizard flow, what to automate vs. leave manual -->

### Design

<!-- TODO: DaisyUI + Tailwind, GHL look-and-feel, light theme, consistent typography -->

### Engineering

<!-- TODO: Backend (Express + LangChain + Zod), frontend (Vue 3 + Pinia), props-driven architecture, prompt-chain design -->

### QA

<!-- TODO: Testability approach — props-driven components, no direct store access, independently testable. Document WHY we chose this over writing tests for a time-boxed assignment -->

## What's Real vs. Mocked

<!-- TODO: Real — GHL API, all LLM calls, prompt patching. Mocked — conversation simulation (two LLMs instead of real telephony), tool execution (MockToolExecutor) -->

## Tech Stack

<!-- TODO: Bullet list — Node.js, Express, Vue 3, Pinia, Tailwind, DaisyUI, LangChain, Anthropic Claude, Zod -->

## License

MIT
