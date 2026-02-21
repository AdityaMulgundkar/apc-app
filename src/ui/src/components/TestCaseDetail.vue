<template>
  <div v-if="tc" class="detail-container">
    <div class="detail-header">
      <span class="detail-id">{{ tc.id }}</span>
      <h2 class="detail-title">{{ tc.scenario }}</h2>
    </div>

    <div class="detail-cards">
      <div class="detail-card">
        <div class="card-label">
          <svg class="card-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          Caller Persona
        </div>
        <p class="card-value">{{ tc.callerPersona }}</p>
      </div>

      <div class="detail-card">
        <div class="card-label">
          <svg class="card-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
          Caller Goal
        </div>
        <p class="card-value">{{ tc.callerGoal }}</p>
      </div>
    </div>

    <div class="criteria-section">
      <h3 class="criteria-heading">Success Criteria</h3>
      <ul class="criteria-list">
        <li
          v-for="sc in tc.successCriteria"
          :key="sc.id"
          class="criteria-item"
        >
          <span class="criteria-badge">{{ sc.category }}</span>
          <span class="criteria-text">{{ sc.description }}</span>
        </li>
      </ul>
    </div>

    <div class="detail-actions">
      <button
        v-if="!store.isTestRun(store.selectedTestIndex)"
        class="run-btn"
        :disabled="store.loading"
        @click="store.runSingleTest(store.selectedTestIndex)"
      >
        <svg class="btn-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
        Run This Test
      </button>
      <span v-else class="run-done" :class="store.testStatus(store.selectedTestIndex) === 'passed' ? 'run-done-pass' : 'run-done-fail'">
        {{ store.testStatus(store.selectedTestIndex) === 'passed' ? 'Passed' : 'Failed' }}
      </span>

      <button
        v-if="store.remainingCount > 0"
        class="run-btn run-btn-secondary"
        :disabled="store.loading"
        @click="store.runRemainingTests()"
      >
        Run Remaining ({{ store.remainingCount }})
      </button>
    </div>
  </div>

  <div v-else class="empty-state">
    <p>Select a test case to view details</p>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';

export default {
  name: 'TestCaseDetail',
  setup() {
    const store = useCopilotStore();
    return { store };
  },
  computed: {
    tc() {
      return this.store.selectedTestCase;
    },
  },
};
</script>

<style scoped>
.detail-container {
  max-width: 640px;
}
.detail-header {
  margin-bottom: 24px;
}
.detail-id {
  font-size: 12px;
  font-weight: 700;
  color: var(--ghl-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.detail-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ghl-text);
  margin: 4px 0 0;
  line-height: 1.3;
}
.detail-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.detail-card {
  flex: 1;
  background: var(--ghl-bg-subtle);
  border: 1px solid var(--ghl-border);
  border-radius: 8px;
  padding: 14px;
}
.card-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ghl-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.card-icon {
  width: 14px;
  height: 14px;
}
.card-value {
  font-size: 14px;
  color: var(--ghl-text);
  margin: 0;
  line-height: 1.5;
}
.criteria-section {
  margin-bottom: 32px;
}
.criteria-heading {
  font-size: 14px;
  font-weight: 600;
  color: var(--ghl-text);
  margin: 0 0 12px;
}
.criteria-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.criteria-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--ghl-border);
  border-radius: 6px;
}
.criteria-badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--ghl-primary);
  background: var(--ghl-primary-light);
  border-radius: 4px;
  padding: 2px 8px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 1px;
}
.criteria-text {
  font-size: 13px;
  color: var(--ghl-text);
  line-height: 1.4;
}
.detail-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
}
.run-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--ghl-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.run-btn:hover {
  background: var(--ghl-primary-hover);
}
.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.run-btn-secondary {
  background: transparent;
  color: var(--ghl-primary);
  border: 1px solid var(--ghl-primary);
}
.run-btn-secondary:hover {
  background: var(--ghl-primary-light);
}
.run-done {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
}
.run-done-pass {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.08);
}
.run-done-fail {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
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
