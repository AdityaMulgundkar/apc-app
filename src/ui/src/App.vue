<template>
  <AppLayout>
    <template #middle v-if="store.step === 'test' || store.step === 'results'">
      <TestCaseList v-if="store.step === 'test'" />
      <TestResultsList v-else-if="store.step === 'results'" />
    </template>

    <template #default>
      <AgentSelector v-if="store.step === 'select'" />
      <TestCaseDetail v-else-if="store.step === 'test'" />
      <ConversationView v-else-if="store.step === 'results'" />
      <OptimizationView v-else-if="store.step === 'optimize'" />
      <ApplyView v-else-if="store.step === 'apply'" />
    </template>
  </AppLayout>
</template>

<script>
import { useCopilotStore } from './stores/copilotStore';
import AppLayout from './components/AppLayout.vue';
import AgentSelector from './components/AgentSelector.vue';
import TestCaseList from './components/TestCaseList.vue';
import TestCaseDetail from './components/TestCaseDetail.vue';
import TestResultsList from './components/TestResultsList.vue';
import ConversationView from './components/ConversationView.vue';
import OptimizationView from './components/OptimizationView.vue';
import ApplyView from './components/ApplyView.vue';

export default {
  name: 'App',
  components: { AppLayout, AgentSelector, TestCaseList, TestCaseDetail, TestResultsList, ConversationView, OptimizationView, ApplyView },
  setup() {
    const store = useCopilotStore();
    return { store };
  },
};
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  font-family: 'Inter var', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
