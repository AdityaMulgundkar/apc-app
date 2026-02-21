<template>
  <div>
    <h2 class="text-2xl font-bold mb-1">Select an Agent</h2>
    <p class="text-base-content/60 mb-6">Choose a Voice AI agent to analyze and optimize.</p>

    <div v-if="store.agents.length === 0" class="text-base-content/50">
      No agents found in this location.
    </div>

    <div v-else class="grid gap-3 max-w-lg">
      <div
        v-for="agent in store.agents"
        :key="agent.id"
        class="card bg-base-200 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary border border-transparent"
        :class="{ 'border-primary bg-primary/5': store.selectedAgentId === agent.id }"
        @click="store.selectAgent(agent.id)"
      >
        <div class="card-body p-4">
          <h3 class="card-title text-base">{{ agent.agentName }}</h3>
          <p class="text-sm text-base-content/60">{{ agent.businessName || 'No business name' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';

export default {
  name: 'AgentSelector',
  setup() {
    const store = useCopilotStore();
    store.loadAgents();
    return { store };
  },
};
</script>
