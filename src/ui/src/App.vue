<template>
  <div id="app">
    <h2>Agent Performance Copilot</h2>

    <div v-if="loading" class="status">Loading agents...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div v-else>
      <label for="agent-select">Select Agent:</label>
      <select id="agent-select" v-model="selectedAgentId" @change="onAgentSelect">
        <option value="" disabled>-- Pick an agent --</option>
        <option v-for="agent in agents" :key="agent.id" :value="agent.id">
          {{ agent.agentName }}
        </option>
      </select>

      <div v-if="agentDetail" class="prompt-section">
        <h3>{{ agentDetail.agentName }}</h3>
        <p class="meta">{{ agentDetail.businessName }} &middot; {{ agentDetail.language || 'en-US' }}</p>
        <h4>Agent Prompt</h4>
        <pre class="prompt-box">{{ agentDetail.agentPrompt }}</pre>
      </div>
    </div>

    <button class="dev-btn" @click="openDevCredentials">Dev Credentials</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      agents: [],
      selectedAgentId: '',
      agentDetail: null,
      loading: true,
      error: null,
    }
  },
  async mounted() {
    try {
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();
      this.agents = data.agents || [];
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async onAgentSelect() {
      if (!this.selectedAgentId) return;
      this.agentDetail = null;
      try {
        const res = await fetch(`/api/agents/${this.selectedAgentId}`);
        if (!res.ok) throw new Error('Failed to fetch agent details');
        this.agentDetail = await res.json();
      } catch (err) {
        this.error = err.message;
      }
    },
    openDevCredentials() {
      window.open('/dev-credentials', '_blank');
    }
  }
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 720px;
  margin: 40px auto;
  padding: 0 20px;
  color: #2c3e50;
}
h2 { margin-bottom: 24px; }
label { font-weight: 600; margin-right: 8px; }
select {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  min-width: 250px;
}
.status { color: #888; margin: 20px 0; }
.status.error { color: red; }
.meta { color: #666; font-size: 14px; margin: 4px 0 16px; }
.prompt-section { margin-top: 24px; }
.prompt-box {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 13px;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
}
.dev-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  padding: 8px 14px;
  font-size: 12px;
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.7;
  z-index: 9999;
}
.dev-btn:hover { opacity: 1; }
</style>
