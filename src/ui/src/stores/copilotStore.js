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
    testResults: null,
    optimization: null,
    selectedTestIndex: 0,

    loading: false,
    error: null,
  }),

  getters: {
    promptModified: (state) => state.editedPrompt !== state.originalPrompt,
    currentPrompt: (state) => state.editedPrompt || state.originalPrompt,
    passRate: (state) => state.testResults?.passRate ?? null,
    failedTests: (state) => {
      if (!state.testResults?.results) return [];
      return state.testResults.results
        .filter((r) => !r.evaluation.overallPass)
        .map((r) => ({
          scenario: r.evaluation.scenario || r.simulation.scenario,
          transcript: r.simulation.transcript,
          criteriaResults: r.evaluation.criteriaResults,
        }));
    },
    selectedTestCase: (state) => state.testCases[state.selectedTestIndex] || null,
    selectedResult: (state) => state.testResults?.results?.[state.selectedTestIndex] || null,
    canAccessStep: (state) => (step) => {
      const reqs = {
        select: true,
        test: state.testCases.length > 0,
        results: !!state.testResults,
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
      this.testResults = null;
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
        const result = await api.generateTestCases(this.selectedAgentId);
        this.testCases = result.testCases || [];
        this.step = 'test';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async runTests() {
      this.loading = true;
      this.error = null;
      try {
        this.testResults = await api.runTests(this.selectedAgentId, this.testCases);
        this.step = 'results';
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
      this.testResults = null;
      this.optimization = null;
      this.selectedTestIndex = 0;
      this.error = null;
    },
  },
});
