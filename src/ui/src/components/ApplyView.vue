<template>
  <div class="apply-container">
    <!-- Header -->
    <div class="apply-header">
      <h2 class="apply-title">{{ store.applied ? 'Prompt Applied' : 'Review & Apply' }}</h2>
      <span v-if="store.applied" class="applied-badge">
        <svg class="badge-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Applied
      </span>
    </div>

    <!-- Pass rate comparison -->
    <div class="rate-comparison">
      <div class="rate-box">
        <span class="rate-label">Baseline</span>
        <span class="rate-value" :class="rateClass(store.baselinePassRate)">
          {{ store.baselinePassRate !== null ? store.baselinePassRate + '%' : '—' }}
        </span>
      </div>
      <svg class="rate-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
      <div class="rate-box">
        <span class="rate-label">Latest</span>
        <span class="rate-value" :class="rateClass(store.passRate)">
          {{ store.passRate !== null ? store.passRate + '%' : '—' }}
        </span>
      </div>
    </div>

    <!-- Iteration count -->
    <p class="iteration-info">Optimized {{ store.iterationCount }} time{{ store.iterationCount !== 1 ? 's' : '' }}</p>

    <!-- Per-test comparison -->
    <div class="comparison-table">
      <div class="table-header">
        <span class="col-test">Test Case</span>
        <span class="col-status">Baseline</span>
        <span class="col-status">Latest</span>
      </div>
      <div
        v-for="row in store.perTestComparison"
        :key="row.id"
        class="table-row"
      >
        <div class="col-test">
          <span class="row-id">{{ row.id }}</span>
          <span class="row-scenario">{{ row.scenario }}</span>
        </div>
        <span class="col-status">
          <span v-if="row.baselinePassed === null" class="status-na">—</span>
          <svg v-else-if="row.baselinePassed" class="status-icon status-pass" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          <svg v-else class="status-icon status-fail" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </span>
        <span class="col-status">
          <span v-if="row.latestPassed === null" class="status-na">—</span>
          <svg v-else-if="row.latestPassed" class="status-icon status-pass" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          <svg v-else class="status-icon status-fail" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="apply-actions">
      <AppButton
        v-if="!store.applied"
        label="Apply to Agent"
        loadingText="Applying..."
        :loading="store.loading"
        @click="store.applyOptimizedPrompt()"
      >
        <template #icon><svg class="btn-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-8.42a14.927 14.927 0 00-2.58 5.841m0 0a3 3 0 10-4.243 4.243" /></svg></template>
      </AppButton>
      <AppButton
        v-if="store.applied"
        label="Start Over"
        variant="secondary"
        @click="store.reset()"
      >
        <template #icon><svg class="btn-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg></template>
      </AppButton>
    </div>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';
import AppButton from './AppButton.vue';

export default {
  name: 'ApplyView',
  components: { AppButton },
  setup() {
    const store = useCopilotStore();
    return { store };
  },
  methods: {
    rateClass(rate) {
      if (rate === null) return '';
      return rate >= 70 ? 'rate-good' : 'rate-bad';
    },
  },
};
</script>

<style scoped>
.apply-container {
  max-width: 600px;
}
.apply-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.apply-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ghl-text);
  margin: 0;
}
.applied-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #16a34a;
  background: rgba(22, 163, 74, 0.1);
  padding: 4px 14px;
  border-radius: 20px;
}
.badge-icon {
  width: 16px;
  height: 16px;
}
.rate-comparison {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
}
.rate-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 32px;
  background: var(--ghl-bg-subtle);
  border: 1px solid var(--ghl-border);
  border-radius: 12px;
  min-width: 120px;
}
.rate-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ghl-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.rate-value {
  font-size: 36px;
  font-weight: 700;
}
.rate-good {
  color: #16a34a;
}
.rate-bad {
  color: #dc2626;
}
.rate-arrow {
  width: 24px;
  height: 24px;
  color: var(--ghl-text-muted);
  flex-shrink: 0;
}
.iteration-info {
  font-size: 13px;
  color: var(--ghl-text-muted);
  margin: 0 0 24px;
}
.comparison-table {
  border: 1px solid var(--ghl-border);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}
.table-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--ghl-bg-subtle);
  font-size: 11px;
  font-weight: 600;
  color: var(--ghl-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--ghl-border);
}
.table-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--ghl-border);
}
.table-row:last-child {
  border-bottom: none;
}
.col-test {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.col-status {
  width: 80px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
.row-id {
  font-size: 11px;
  font-weight: 700;
  color: var(--ghl-primary);
  text-transform: uppercase;
  flex-shrink: 0;
}
.row-scenario {
  font-size: 12px;
  color: var(--ghl-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status-icon {
  width: 18px;
  height: 18px;
}
.status-pass {
  color: #16a34a;
}
.status-fail {
  color: #dc2626;
}
.status-na {
  font-size: 14px;
  color: var(--ghl-text-muted);
  font-weight: 700;
}
.apply-actions {
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
</style>
