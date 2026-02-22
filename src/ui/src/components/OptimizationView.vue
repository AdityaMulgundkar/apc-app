<template>
  <div v-if="store.optimization" class="opt-container">
    <div class="opt-header">
      <h2 class="opt-title">Prompt Optimization</h2>
      <p class="opt-summary">{{ store.optimization.changesSummary }}</p>
    </div>

    <div class="changes-list">
      <div v-for="(c, i) in store.optimization.changes" :key="i" class="change-card">
        <div class="change-issue">
          <svg class="change-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          {{ c.issue }}
        </div>
        <div class="change-fix">
          <svg class="change-icon fix-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ c.fix }}
        </div>
      </div>
    </div>

    <div class="diff-section">
      <div class="diff-col">
        <div class="diff-label diff-label-old">Original</div>
        <pre class="diff-content" v-html="originalHtml"></pre>
      </div>
      <div class="diff-col">
        <div class="diff-label diff-label-new">Optimized</div>
        <pre class="diff-content" v-html="optimizedHtml"></pre>
      </div>
    </div>

    <div class="opt-actions">
      <button
        class="action-btn action-btn-primary"
        :disabled="store.loading"
        @click="rerunFailed"
      >
        <svg class="btn-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
        Re-run Failed Tests
      </button>
      <button
        class="action-btn action-btn-secondary"
        :disabled="store.loading"
        @click="rerunAll"
      >
        Re-run All Tests
      </button>
    </div>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';
import { diffWords } from 'diff';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  name: 'OptimizationView',
  setup() {
    const store = useCopilotStore();
    return { store };
  },
  methods: {
    rerunFailed() {
      this.store.step = 'test';
      this.$nextTick(() => this.store.runRemainingTests());
    },
    rerunAll() {
      this.store.testResults = new Array(this.store.testCases.length).fill(null);
      this.store.step = 'test';
      this.$nextTick(() => this.store.runRemainingTests());
    },
  },
  computed: {
    diffParts() {
      if (!this.store.optimization) return [];
      const before = this.store.promptSnapshotAtRun || this.store.originalPrompt;
      return diffWords(before, this.store.optimization.optimizedPrompt);
    },
    originalHtml() {
      return this.diffParts
        .filter((p) => !p.added)
        .map((p) =>
          p.removed
            ? `<span class="diff-removed">${escapeHtml(p.value)}</span>`
            : escapeHtml(p.value)
        )
        .join('');
    },
    optimizedHtml() {
      return this.diffParts
        .filter((p) => !p.removed)
        .map((p) =>
          p.added
            ? `<span class="diff-added">${escapeHtml(p.value)}</span>`
            : escapeHtml(p.value)
        )
        .join('');
    },
  },
};
</script>

<style scoped>
.opt-container {
  max-width: 960px;
}
.opt-header {
  margin-bottom: 20px;
}
.opt-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ghl-text);
  margin: 0 0 6px;
}
.opt-summary {
  font-size: 14px;
  color: var(--ghl-text-muted);
  margin: 0;
  line-height: 1.5;
}
.changes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}
.change-card {
  padding: 12px 14px;
  border: 1px solid var(--ghl-border);
  border-radius: 8px;
  background: #fff;
}
.change-issue {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #b45309;
  margin-bottom: 6px;
}
.change-fix {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #16a34a;
}
.change-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}
.diff-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.diff-col {
  flex: 1;
  min-width: 0;
}
.diff-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 6px 12px;
  border-radius: 6px 6px 0 0;
}
.diff-label-old {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
}
.diff-label-new {
  background: rgba(22, 163, 74, 0.08);
  color: #16a34a;
}
.diff-content {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ghl-text);
  background: var(--ghl-bg-subtle);
  border: 1px solid var(--ghl-border);
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 14px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 500px;
  overflow-y: auto;
}
.diff-content :deep(.diff-removed) {
  background: rgba(220, 38, 38, 0.15);
  color: #991b1b;
  text-decoration: line-through;
  border-radius: 2px;
  padding: 0 2px;
}
.diff-content :deep(.diff-added) {
  background: rgba(22, 163, 74, 0.15);
  color: #166534;
  border-radius: 2px;
  padding: 0 2px;
}
.opt-actions {
  position: sticky;
  bottom: -24px;
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--ghl-border);
  background: #fff;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  border: none;
}
.action-btn-primary {
  color: #fff;
  background: var(--ghl-primary);
}
.action-btn-primary:hover {
  background: var(--ghl-primary-hover);
}
.action-btn-secondary {
  color: var(--ghl-primary);
  background: transparent;
  border: 1px solid var(--ghl-primary);
}
.action-btn-secondary:hover {
  background: var(--ghl-primary-light);
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-icon {
  width: 16px;
  height: 16px;
}
</style>
