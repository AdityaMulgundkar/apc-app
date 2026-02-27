<template>
  <AppLayout
    :step="store.step"
    :error="store.error"
    :accessibleSteps="['select', 'test', 'results', 'optimize', 'apply'].filter(id => store.canAccessStep(id))"
    @goToStep="store.goToStep($event)"
    @clearError="store.error = null"
  >
    <template #middle v-if="store.step === 'test' || store.step === 'results'">
      <TestCaseList
        v-if="store.step === 'test'"
        :testCases="store.testCases"
        :selectedIndex="store.selectedTestIndex"
        :statuses="store.testCases.map((_, i) => store.testStatus(i))"
        @select="store.selectTest"
      />
      <TestResultsList
        v-else-if="store.step === 'results'"
        :testCases="store.testCases"
        :selectedIndex="store.selectedTestIndex"
        :statuses="store.testCases.map((_, i) => store.testStatus(i))"
        :runFlags="store.testCases.map((_, i) => store.isTestRun(i))"
        :passRate="store.passRate"
        @select="store.selectTest"
      />
    </template>

    <template #default>
      <AgentSelector
        v-if="store.step === 'select'"
        :agents="store.agents"
        :selectedAgentId="store.selectedAgentId || ''"
        :agent="store.agent"
        :applied="store.applied"
        :categoryCounts="store.categoryCounts"
        :totalTestCount="store.totalTestCount"
        :loading="store.loading"
        :editedPrompt="store.editedPrompt"
        :promptModified="store.promptModified"
        @selectAgent="store.selectAgent($event)"
        @updateCategoryCount="(cat, val) => store.updateCategoryCount(cat, val)"
        @updatePrompt="store.updateEditedPrompt($event)"
        @generateTests="store.generateTests()"
      />
      <TestCaseDetail
        v-else-if="store.step === 'test'"
        :testCase="store.selectedTestCase"
        :status="store.testStatus(store.selectedTestIndex)"
        :isRun="store.isTestRun(store.selectedTestIndex)"
        :applied="store.applied"
        :loading="store.loading"
        :remainingCount="store.remainingCount"
        @runSingle="store.runSingleTest(store.selectedTestIndex)"
        @runRemaining="store.runRemainingTests()"
      />
      <ConversationView
        v-else-if="store.step === 'results'"
        :testCase="store.selectedTestCase"
        :result="store.selectedResult"
        :loading="store.loading"
        :stale="store.resultsAreStale"
        :showOptimize="store.failedTests.length > 0 && !store.resultsAreStale && !store.applied"
        @optimize="store.optimize()"
      />
      <OptimizationView
        v-else-if="store.step === 'optimize'"
        :optimization="store.optimization"
        :loadingAction="rerunMode"
        :beforePrompt="store.promptSnapshotAtRun || store.originalPrompt"
        @rerunFailed="handleRerunFailed"
        @rerunAll="handleRerunAll"
      />
      <ApplyView
        v-else-if="store.step === 'apply'"
        :applied="store.applied"
        :testCount="store.testCases.length"
        :baselinePassRate="store.baselinePassRate"
        :passRate="store.passRate"
        :iterationCount="store.iterationCount"
        :perTestComparison="store.perTestComparison"
        :loading="store.loading"
        :originalPrompt="store.originalPrompt"
        :currentPrompt="store.currentPrompt"
        @apply="store.applyOptimizedPrompt()"
        @reset="store.reset()"
      />
    </template>
  </AppLayout>
</template>

<script>
import { onMounted } from 'vue';
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
    onMounted(() => { store.loadAgents(); });
    return { store };
  },
  data() {
    return { rerunMode: null };
  },
  methods: {
    async handleRerunFailed() {
      this.rerunMode = 'failed';
      await this.store.runFailedTests();
      this.rerunMode = null;
      this.store.step = 'results';
    },
    async handleRerunAll() {
      this.rerunMode = 'all';
      this.store.resetAllResults();
      await this.store.runRemainingTests();
      this.rerunMode = null;
      this.store.step = 'results';
    },
  },
};
</script>
