import { defineStore } from 'pinia';
import * as api from '../api/copilotClient';

export const useCopilotStore = defineStore('copilot', {
  state: () => ({
    // Step tracking
    step: 'select',  // select | review | test | results | optimize | apply

    // Agents
    agents: [],
    selectedAgentId: null,
    agent: null,

    // Test generation
    testCases: [],

    // Test results
    testResults: null,

    // Optimization
    optimization: null,

    // UI state
    loading: false,
    error: null,
  }),

  getters: {
    currentPrompt: (state) => state.agent?.agentPrompt || '',
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
  },

  actions: {
    async loadAgents() {
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
        this.step = 'review';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
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
        this.step = 'apply';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.step = 'select';
      this.selectedAgentId = null;
      this.agent = null;
      this.testCases = [];
      this.testResults = null;
      this.optimization = null;
      this.error = null;
    },
  },
});
