<template>
  <div>
    <h2 class="text-2xl font-bold mb-1">Select & Review Agent</h2>
    <p class="text-sm text-base-content/60 mb-5">Choose a Voice AI agent, review its prompt, then generate test cases.</p>

    <div class="toolbar">
      <AppDropdown
        :modelValue="store.selectedAgentId || ''"
        @update:modelValue="onAgentSelect"
        :options="agentOptions"
        placeholder="Select an agent"
        width="16rem"
      />

      <AppButton
        v-if="store.agent && !store.applied"
        label="Generate Test Cases"
        loadingText="Generating..."
        :loading="store.loading"
        :disabled="!store.editedPrompt.trim()"
        @click="store.generateTests()"
      >
        <template #icon><svg class="btn-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V19a2 2 0 01-2 2H7a2 2 0 01-2-2v-4.5" /></svg></template>
      </AppButton>
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

      <div class="tools-section" v-if="store.agent.actions && store.agent.actions.length">
        <h3 class="tools-title">
          <svg class="tools-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L3.34 8.09a1.5 1.5 0 010-2.12l.88-.88a1.5 1.5 0 012.12 0l4.08 4.08m0 0l1.415-1.414a2.121 2.121 0 013 0l.708.707a2.121 2.121 0 010 3l-1.415 1.414m0 0l4.08 4.08a1.5 1.5 0 010 2.12l-.88.88a1.5 1.5 0 01-2.12 0l-4.08-4.08" /></svg>
          Configured Tools ({{ store.agent.actions.length }})
        </h3>
        <div class="tools-list">
          <div v-for="action in store.agent.actions" :key="action.id" class="tool-card">
            <div class="tool-name">{{ action.name }}</div>
            <span class="tool-type">{{ action.actionType.replace(/_/g, ' ') }}</span>
            <p v-if="action.actionParameters?.description" class="tool-desc">{{ action.actionParameters.description }}</p>
          </div>
        </div>
      </div>
      <div class="tools-section" v-else-if="store.agent">
        <p class="no-tools">No tools configured on this agent.</p>
      </div>
    </template>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';
import AppDropdown from './AppDropdown.vue';
import AppButton from './AppButton.vue';

export default {
  name: 'AgentSelector',
  components: { AppDropdown, AppButton },
  setup() {
    const store = useCopilotStore();
    store.loadAgents();
    return { store };
  },
  computed: {
    agentOptions() {
      return this.store.agents.map((a) => ({ value: a.id, label: a.agentName }));
    },
  },
  methods: {
    onAgentSelect(agentId) {
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
.tools-section {
  margin-top: 20px;
}
.tools-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ghl-text);
  margin: 0 0 10px;
}
.tools-icon {
  width: 16px;
  height: 16px;
}
.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tool-card {
  padding: 10px 14px;
  border: 1px solid var(--ghl-border);
  border-radius: 8px;
  background: #fff;
  min-width: 200px;
}
.tool-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ghl-text);
  margin-bottom: 4px;
}
.tool-type {
  font-size: 10px;
  font-weight: 500;
  color: var(--ghl-primary);
  background: var(--ghl-primary-light);
  border-radius: 4px;
  padding: 2px 8px;
  text-transform: lowercase;
}
.tool-desc {
  font-size: 12px;
  color: var(--ghl-text-muted);
  margin: 6px 0 0;
  line-height: 1.4;
}
.no-tools {
  font-size: 13px;
  color: var(--ghl-text-muted);
  margin: 0;
}
</style>
