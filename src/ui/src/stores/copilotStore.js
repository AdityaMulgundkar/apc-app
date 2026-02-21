import { defineStore } from 'pinia';
import * as api from '../api/copilotClient';

export const useCopilotStore = defineStore('copilot', {
  state: () => ({
    step: 'select',  // select | test | results | optimize | apply

    agents: [],
    selectedAgentId: null,
    agent: null,

    originalPrompt: '',
    editedPrompt: '',

    testCases: [],
    testResults: [],   // same length as testCases, null = not run
    optimization: null,
    selectedTestIndex: 0,

    loading: false,
    error: null,
  }),

  getters: {
    promptModified: (state) => state.editedPrompt !== state.originalPrompt,
    currentPrompt: (state) => state.editedPrompt || state.originalPrompt,
    completedResults: (state) => state.testResults.filter((r) => r !== null),
    hasAnyResult: (state) => state.testResults.some((r) => r !== null),
    allTestsRun: (state) =>
      state.testResults.length > 0 && state.testResults.every((r) => r !== null),
    remainingCount: (state) => state.testResults.filter((r) => r === null).length,
    passRate: (state) => {
      const completed = state.testResults.filter((r) => r !== null);
      if (!completed.length) return null;
      const passed = completed.filter((r) => r.evaluation.overallPass).length;
      return Math.round((passed / completed.length) * 100);
    },
    failedTests: (state) => {
      return state.testResults
        .filter((r) => r !== null && !r.evaluation.overallPass)
        .map((r) => r.evaluation);
    },
    selectedTestCase: (state) => state.testCases[state.selectedTestIndex] || null,
    selectedResult: (state) => state.testResults[state.selectedTestIndex] || null,
    isTestRun: (state) => (index) => state.testResults[index] !== null,
    testStatus: (state) => (index) => {
      const r = state.testResults[index];
      if (r === null || r === undefined) return 'pending';
      return r.evaluation.overallPass ? 'passed' : 'failed';
    },
    canAccessStep: (state) => (step) => {
      const hasAnyResult = state.testResults.some((r) => r !== null);
      const reqs = {
        select: true,
        test: state.testCases.length > 0,
        results: hasAnyResult,
        optimize: !!state.optimization,
        apply: !!state.optimization,
      };
      return reqs[step] ?? false;
    },
  },

  actions: {
    async loadAgents() {
      if (this.agents.length > 0 || this.loading) return;
      this.loading = true;
      this.error = null;
      try {
        const data = await api.listAgents();
        this.agents = data.agents || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async selectAgent(agentId) {
      this.loading = true;
      this.error = null;
      this.selectedAgentId = agentId;
      this.testCases = [];
      this.testResults = [];
      this.optimization = null;
      try {
        this.agent = await api.getAgent(agentId);
        this.originalPrompt = this.agent.agentPrompt || '';
        this.editedPrompt = this.originalPrompt;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    updateEditedPrompt(value) {
      this.editedPrompt = value;
    },

    async generateTests() {
      this.loading = true;
      this.error = null;
      try {
        const result = await api.generateTestCases(this.selectedAgentId, this.currentPrompt);
        this.testCases = result.testCases || [];
        this.testResults = new Array(this.testCases.length).fill(null);
        this.step = 'test';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async runSingleTest(index) {
      if (this.testResults[index] !== null) return;
      this.loading = true;
      this.error = null;
      try {
        const tc = this.testCases[index];
        const response = await api.runTests(this.selectedAgentId, [tc]);
        this.testResults[index] = response.results[0];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async runRemainingTests() {
      const pending = this.testCases
        .map((tc, i) => ({ tc, i }))
        .filter(({ i }) => this.testResults[i] === null);
      if (!pending.length) return;
      this.loading = true;
      this.error = null;
      try {
        const response = await api.runTests(
          this.selectedAgentId,
          pending.map(({ tc }) => tc),
        );
        pending.forEach(({ i }, j) => {
          this.testResults[i] = response.results[j];
        });
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async optimize() {
      this.loading = true;
      this.error = null;
      try {
        this.optimization = await api.optimizePrompt(this.selectedAgentId, this.failedTests);
        this.step = 'optimize';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async applyOptimizedPrompt() {
      this.loading = true;
      this.error = null;
      try {
        await api.applyPrompt(this.selectedAgentId, this.optimization.optimizedPrompt);
        this.agent.agentPrompt = this.optimization.optimizedPrompt;
        this.originalPrompt = this.optimization.optimizedPrompt;
        this.editedPrompt = this.optimization.optimizedPrompt;
        this.step = 'apply';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    selectTest(index) {
      this.selectedTestIndex = index;
    },

    goToStep(step) {
      if (this.canAccessStep(step)) {
        this.step = step;
        this.selectedTestIndex = 0;
      }
    },

    reset() {
      this.step = 'select';
      this.selectedAgentId = null;
      this.agent = null;
      this.originalPrompt = '';
      this.editedPrompt = '';
      this.testCases = [];
      this.testResults = [];
      this.optimization = null;
      this.selectedTestIndex = 0;
      this.error = null;
    },
  },
});
