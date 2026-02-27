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

    categoryCounts: { red: 2, blue: 2, biased: 1, general: 1 },
    testCases: [],
    testResults: [],        // same length as testCases, null = not run
    baselineResults: [],    // per-test first-ever result (locked once set)
    optimization: null,
    selectedTestIndex: 0,
    iterationCount: 0,
    applied: false,
    promptSnapshotAtRun: '',

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
    resultsAreStale() {
      if (!this.promptSnapshotAtRun) return false;
      return this.currentPrompt !== this.promptSnapshotAtRun;
    },
    passRate: (state) => {
      const completed = state.testResults.filter((r) => r !== null);
      if (!completed.length) return null;
      const passed = completed.filter((r) => r.evaluation.overallPass).length;
      return Math.round((passed / completed.length) * 100);
    },
    baselinePassRate: (state) => {
      const completed = state.baselineResults.filter((r) => r !== null);
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
    perTestComparison: (state) => {
      return state.testCases.map((tc, i) => {
        const baseline = state.baselineResults[i];
        const latest = state.testResults[i];
        return {
          id: tc.id,
          scenario: tc.scenario,
          baselinePassed: baseline ? baseline.evaluation.overallPass : null,
          latestPassed: latest ? latest.evaluation.overallPass : null,
        };
      });
    },
    totalTestCount: (state) =>
      Object.values(state.categoryCounts).reduce((sum, n) => sum + (n || 0), 0),
    testCasesByCategory: (state) => {
      const grouped = { red: [], blue: [], biased: [], general: [] };
      for (const tc of state.testCases) {
        if (grouped[tc.category]) grouped[tc.category].push(tc);
      }
      return grouped;
    },
    canAccessStep() {
      return (step) => {
        const hasAnyResult = this.testResults.some((r) => r !== null);
        const reqs = {
          select: true,
          test: this.testCases.length > 0,
          results: hasAnyResult,
          optimize: this.optimization !== null,
          apply: hasAnyResult,
        };
        return reqs[step] ?? false;
      };
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
      this.baselineResults = [];
      this.optimization = null;
      this.iterationCount = 0;
      this.applied = false;
      this.promptSnapshotAtRun = '';
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

    updateCategoryCount(category, value) {
      this.categoryCounts = {
        ...this.categoryCounts,
        [category]: Math.max(0, Math.min(10, Math.round(value))),
      };
    },

    async generateTests() {
      this.loading = true;
      this.error = null;
      try {
        const result = await api.generateTestCases(this.selectedAgentId, this.currentPrompt, this.agent?.actions, this.categoryCounts);
        this.testCases = result.testCases || [];
        this.testResults = new Array(this.testCases.length).fill(null);
        this.baselineResults = new Array(this.testCases.length).fill(null);
        this.step = 'test';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    _lockBaseline(index, result) {
      if (this.baselineResults[index] === null) {
        this.baselineResults[index] = result;
      }
    },

    async runSingleTest(index) {
      if (this.testResults[index] !== null) return;
      this.loading = true;
      this.error = null;
      try {
        const tc = this.testCases[index];
        const response = await api.runTests(this.selectedAgentId, [tc], this.currentPrompt, this.agent?.actions);
        this.testResults[index] = response.results[0];
        this._lockBaseline(index, response.results[0]);
        this.promptSnapshotAtRun = this.currentPrompt;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async runFailedTests() {
      const failed = this.testCases
        .map((tc, i) => ({ tc, i }))
        .filter(({ i }) => {
          const r = this.testResults[i];
          return r !== null && !r.evaluation.overallPass;
        });
      if (!failed.length) return;
      this.loading = true;
      this.error = null;
      try {
        const response = await api.runTests(
          this.selectedAgentId,
          failed.map(({ tc }) => tc),
          this.currentPrompt,
          this.agent?.actions,
        );
        failed.forEach(({ i }, j) => {
          this.testResults[i] = response.results[j];
          this._lockBaseline(i, response.results[j]);
        });
        this.promptSnapshotAtRun = this.currentPrompt;
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
          this.currentPrompt,
          this.agent?.actions,
        );
        pending.forEach(({ i }, j) => {
          this.testResults[i] = response.results[j];
          this._lockBaseline(i, response.results[j]);
        });
        this.promptSnapshotAtRun = this.currentPrompt;
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
        this.optimization = await api.optimizePrompt(this.selectedAgentId, this.failedTests, this.currentPrompt, this.agent?.actions);
        this.editedPrompt = this.optimization.optimizedPrompt;
        this.iterationCount++;
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
        await api.applyPrompt(this.selectedAgentId, this.currentPrompt);
        this.agent.agentPrompt = this.currentPrompt;
        this.originalPrompt = this.currentPrompt;
        this.applied = true;
        this.step = 'apply';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    resetAllResults() {
      this.testResults = new Array(this.testCases.length).fill(null);
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
      this.baselineResults = [];
      this.optimization = null;
      this.selectedTestIndex = 0;
      this.iterationCount = 0;
      this.applied = false;
      this.promptSnapshotAtRun = '';
      this.error = null;
    },
  },
});
