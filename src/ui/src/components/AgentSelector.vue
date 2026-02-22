<template>
  <div>
    <h2 class="text-2xl font-bold mb-1">Select & Review Agent</h2>
    <p class="text-sm text-base-content/60 mb-5">Choose a Voice AI agent, review its prompt, then generate test cases.</p>

    <div class="toolbar">
      <select
        class="agent-select"
        :value="store.selectedAgentId || ''"
        @change="onAgentChange($event.target.value)"
      >
        <option value="" disabled>-- Pick an agent --</option>
        <option v-for="a in store.agents" :key="a.id" :value="a.id">{{ a.agentName }}</option>
      </select>

      <button
        v-if="store.agent && !store.applied"
        class="generate-btn"
        :disabled="store.loading || !store.editedPrompt.trim()"
        @click="store.generateTests()"
      >
        <svg class="btn-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V19a2 2 0 01-2 2H7a2 2 0 01-2-2v-4.5" /></svg>
        Generate Test Cases
      </button>
    </div>

    <template v-if="store.agent">
      <div class="prompt-header">
        <h3 class="prompt-title">Agent Prompt</h3>
        <span class="prompt-meta">{{ store.agent.businessName }} &middot; {{ store.agent.language || 'en-US' }}</span>
      </div>

      <textarea
        class="prompt-textarea"
        rows="18"
        :value="store.editedPrompt"
        :disabled="store.applied"
        @input="store.updateEditedPrompt($event.target.value)"
      ></textarea>

      <div class="indicator-row">
        <div v-if="store.promptModified" class="modified-indicator">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          Prompt modified from original
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';

export default {
  name: 'AgentSelector',
  setup() {
    const store = useCopilotStore();
    store.loadAgents();
    return { store };
  },
  methods: {
    onAgentChange(agentId) {
      if (agentId) {
        this.store.selectAgent(agentId);
      }
    },
  },
};
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.agent-select {
  appearance: auto;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid var(--ghl-border);
  border-radius: 8px;
  background: #fff;
  min-width: 250px;
  height: 40px;
  color: var(--ghl-text);
}
.agent-select:focus {
  outline: 2px solid var(--ghl-primary);
  outline-offset: 1px;
  border-color: var(--ghl-primary);
}
.generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--ghl-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  height: 40px;
  white-space: nowrap;
  transition: background 0.15s;
}
.generate-btn:hover {
  background: var(--ghl-primary-hover);
}
.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.prompt-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ghl-text);
}
.prompt-meta {
  font-size: 12px;
  color: var(--ghl-text-muted);
}
.prompt-textarea {
  width: 100%;
  padding: 16px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  border: 1px solid var(--ghl-border);
  border-radius: 8px;
  background: var(--ghl-bg-subtle);
  color: var(--ghl-text);
  resize: vertical;
  box-sizing: border-box;
}
.prompt-textarea:focus {
  outline: 2px solid var(--ghl-primary);
  outline-offset: 1px;
  border-color: var(--ghl-primary);
  background: #fff;
}
.indicator-row {
  height: 24px;
  margin-top: 4px;
}
.modified-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ghl-warning);
}
</style>
