<template>
  <div v-if="result" class="conversation-wrapper">
    <div class="conv-header">
      <div>
        <span class="conv-id">{{ store.selectedTestCase?.id }}</span>
        <h2 class="conv-title">{{ store.selectedTestCase?.scenario }}</h2>
      </div>
      <span class="conv-verdict" :class="result.evaluation.overallPass ? 'verdict-pass' : 'verdict-fail'">
        {{ result.evaluation.overallPass ? 'Passed' : 'Failed' }}
      </span>
    </div>

    <div v-if="store.resultsAreStale" class="stale-banner">
      <svg class="stale-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
      Prompt has been modified — these results may be outdated
    </div>

    <div class="chat-area">
      <div
        v-for="(msg, i) in result.simulation.transcript"
        :key="i"
        class="chat-row"
        :class="msg.role === 'agent' ? 'chat-row-agent' : 'chat-row-caller'"
      >
        <div class="chat-label">{{ msg.role === 'agent' ? 'AI Agent' : 'Caller' }}</div>
        <div class="chat-bubble" :class="msg.role === 'agent' ? 'bubble-agent' : 'bubble-caller'">
          {{ msg.content }}
        </div>
      </div>
    </div>

    <div class="eval-section">
      <h3 class="eval-heading">Evaluation</h3>
      <p class="eval-summary">{{ result.evaluation.summary }}</p>

      <div class="criteria-results">
        <div
          v-for="cr in result.evaluation.criterionResults"
          :key="cr.criterionId"
          class="criterion-row"
        >
          <div class="criterion-header">
            <svg v-if="cr.passed" class="criterion-icon criterion-pass" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            <svg v-else class="criterion-icon criterion-fail" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            <span class="criterion-id">{{ cr.criterionId }}</span>
          </div>
          <p class="criterion-reasoning">{{ cr.reasoning }}</p>
        </div>
      </div>
    </div>

    <div v-if="store.failedTests.length > 0 && !store.resultsAreStale && !store.applied" class="conv-actions">
      <AppButton
        label="Optimize Prompt"
        loadingText="Optimizing..."
        :loading="store.loading"
        @click="store.optimize()"
      >
        <template #icon><svg class="btn-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg></template>
      </AppButton>
    </div>
  </div>

  <div v-else class="empty-state">
    <p>Select a result to view the conversation</p>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';
import AppButton from './AppButton.vue';

export default {
  name: 'ConversationView',
  components: { AppButton },
  setup() {
    const store = useCopilotStore();
    return { store };
  },
  computed: {
    result() {
      return this.store.selectedResult;
    },
  },
};
</script>

<style scoped>
.conversation-wrapper {
  max-width: 700px;
}
.stale-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #b45309;
  background: rgba(217, 119, 6, 0.08);
  border: 1px solid rgba(217, 119, 6, 0.2);
  border-radius: 8px;
}
.stale-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.conv-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.conv-id {
  font-size: 12px;
  font-weight: 700;
  color: var(--ghl-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.conv-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ghl-text);
  margin: 4px 0 0;
  line-height: 1.3;
}
.conv-verdict {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  flex-shrink: 0;
}
.verdict-pass {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.1);
}
.verdict-fail {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

/* Chat bubbles */
.chat-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}
.chat-row {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}
.chat-row-agent {
  align-self: flex-start;
}
.chat-row-caller {
  align-self: flex-end;
}
.chat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--ghl-text-muted);
  margin-bottom: 4px;
  padding: 0 4px;
}
.chat-row-caller .chat-label {
  text-align: right;
}
.chat-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}
.bubble-agent {
  background: var(--ghl-bg-subtle);
  border: 1px solid var(--ghl-border);
  color: var(--ghl-text);
  border-top-left-radius: 4px;
}
.bubble-caller {
  background: var(--ghl-primary);
  color: #fff;
  border-top-right-radius: 4px;
}

/* Evaluation */
.eval-section {
  border-top: 1px solid var(--ghl-border);
  padding-top: 24px;
  margin-bottom: 24px;
}
.eval-heading {
  font-size: 15px;
  font-weight: 600;
  color: var(--ghl-text);
  margin: 0 0 8px;
}
.eval-summary {
  font-size: 14px;
  color: var(--ghl-text);
  line-height: 1.5;
  margin: 0 0 16px;
}
.criteria-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.criterion-row {
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--ghl-border);
  border-radius: 6px;
}
.criterion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.criterion-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.criterion-pass {
  color: #16a34a;
}
.criterion-fail {
  color: #dc2626;
}
.criterion-id {
  font-size: 12px;
  font-weight: 600;
  color: var(--ghl-text);
}
.criterion-reasoning {
  font-size: 13px;
  color: var(--ghl-text-muted);
  margin: 0;
  line-height: 1.4;
  padding-left: 24px;
}

/* Actions */
.conv-actions {
  position: sticky;
  bottom: -24px;
  padding: 16px 0;
  border-top: 1px solid var(--ghl-border);
  background: #fff;
}
.btn-icon {
  width: 16px;
  height: 16px;
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--ghl-text-muted);
  font-size: 14px;
}
</style>
