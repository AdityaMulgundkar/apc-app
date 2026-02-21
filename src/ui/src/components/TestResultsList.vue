<template>
  <div class="flex flex-col h-full">
    <div class="panel-header">
      <h3 class="panel-title">Results</h3>
      <span v-if="store.passRate !== null" class="panel-badge" :class="store.passRate >= 70 ? 'badge-pass' : 'badge-fail'">
        {{ store.passRate }}%
      </span>
    </div>

    <ul class="flex-1 overflow-y-auto">
      <li
        v-for="(tc, i) in store.testCases"
        :key="tc.id"
        class="result-item"
        :class="{
          'result-item-active': i === store.selectedTestIndex,
          'result-item-disabled': !store.isTestRun(i),
        }"
        @click="store.isTestRun(i) && store.selectTest(i)"
      >
        <div class="flex items-center gap-2">
          <span v-if="!store.isTestRun(i)" class="status-icon status-pending">—</span>
          <svg v-else-if="store.testStatus(i) === 'passed'" class="status-icon status-pass" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          <svg v-else class="status-icon status-fail" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          <div class="flex-1 min-w-0">
            <span class="result-id">{{ tc.id }}</span>
            <p class="result-scenario">{{ tc.scenario }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';

export default {
  name: 'TestResultsList',
  setup() {
    const store = useCopilotStore();
    return { store };
  },
};
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--ghl-border);
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ghl-text);
}
.panel-badge {
  font-size: 12px;
  font-weight: 700;
  border-radius: 10px;
  padding: 2px 10px;
}
.badge-pass {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}
.badge-fail {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}
.result-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--ghl-border);
  cursor: pointer;
  transition: background 0.1s;
}
.result-item:hover:not(.result-item-disabled) {
  background: var(--ghl-primary-light);
}
.result-item-active {
  background: var(--ghl-primary-light);
  border-left: 3px solid var(--ghl-primary);
  padding-left: 13px;
}
.result-item-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.status-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.status-pending {
  color: var(--ghl-text-muted);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  line-height: 16px;
}
.status-pass {
  color: #16a34a;
}
.status-fail {
  color: #dc2626;
}
.result-id {
  font-size: 11px;
  font-weight: 700;
  color: var(--ghl-primary);
  text-transform: uppercase;
}
.result-scenario {
  font-size: 12px;
  color: var(--ghl-text);
  margin: 2px 0 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
