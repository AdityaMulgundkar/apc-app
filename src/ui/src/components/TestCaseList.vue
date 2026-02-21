<template>
  <div class="flex flex-col h-full">
    <div class="panel-header">
      <h3 class="panel-title">Test Cases</h3>
      <span class="panel-badge">{{ store.testCases.length }}</span>
    </div>

    <ul class="flex-1 overflow-y-auto">
      <li
        v-for="(tc, i) in store.testCases"
        :key="tc.id"
        class="test-item"
        :class="{ 'test-item-active': i === store.selectedTestIndex }"
        @click="store.selectTest(i)"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="test-id">{{ tc.id }}</span>
          <span class="test-category">{{ tc.successCriteria?.[0]?.category }}</span>
        </div>
        <p class="test-scenario">{{ tc.scenario }}</p>
        <p class="test-persona">{{ tc.callerPersona }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';

export default {
  name: 'TestCaseList',
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
  font-weight: 600;
  background: var(--ghl-primary);
  color: #fff;
  border-radius: 10px;
  padding: 1px 8px;
}
.test-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--ghl-border);
  cursor: pointer;
  transition: background 0.1s;
}
.test-item:hover {
  background: var(--ghl-primary-light);
}
.test-item-active {
  background: var(--ghl-primary-light);
  border-left: 3px solid var(--ghl-primary);
  padding-left: 13px;
}
.test-id {
  font-size: 11px;
  font-weight: 700;
  color: var(--ghl-primary);
  text-transform: uppercase;
}
.test-category {
  font-size: 10px;
  font-weight: 500;
  color: var(--ghl-text-muted);
  background: var(--ghl-bg-subtle);
  border-radius: 4px;
  padding: 1px 6px;
}
.test-scenario {
  font-size: 13px;
  color: var(--ghl-text);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.test-persona {
  font-size: 11px;
  color: var(--ghl-text-muted);
  margin: 4px 0 0;
}
</style>
