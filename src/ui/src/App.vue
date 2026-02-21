<template>
  <AppLayout>
    <template v-if="store.step === 'select'">
      <AgentSelector />
    </template>

    <template v-else>
      <div class="flex flex-col items-center justify-center h-64 text-base-content/50">
        <p class="text-lg mb-4">Step: <span class="font-semibold text-base-content">{{ store.step }}</span></p>
        <p class="mb-4">Component coming soon.</p>
        <button class="btn btn-outline btn-sm" @click="store.reset()">← Back to Agent Select</button>
      </div>
    </template>
  </AppLayout>
</template>

<script>
import { useCopilotStore } from './stores/copilotStore';
import AppLayout from './components/AppLayout.vue';
import AgentSelector from './components/AgentSelector.vue';

export default {
  name: 'App',
  components: { AppLayout, AgentSelector },
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
