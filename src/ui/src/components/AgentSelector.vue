<template>
  <div>
    <h2 class="text-xl font-semibold mb-1">Select & Review Agent</h2>
    <p class="text-sm text-base-content/60 mb-5">Choose a Voice AI agent, review its prompt, then generate test cases.</p>

    <div class="flex items-center gap-3 mb-6">
      <AppDropdown
        :modelValue="selectedAgentId || ''"
        @update:modelValue="onAgentSelect"
        :options="agentOptions"
        placeholder="Select an agent"
        width="16rem"
      />

      <template v-if="agent && !applied">
        <div class="flex items-center gap-3 flex-wrap">
          <label
            v-for="cat in categories"
            :key="cat.key"
            class="flex items-center gap-1.5"
          >
            <span
              class="text-xs font-semibold px-1.5 py-0.5 rounded"
              :class="cat.badgeClass"
            >{{ cat.label }}</span>
            <input
              type="number"
              class="input input-bordered w-16 text-center text-sm"
              :value="categoryCounts[cat.key]"
              @input="$emit('updateCategoryCount', cat.key, Number($event.target.value))"
              min="0"
              max="10"
            />
          </label>
        </div>
        <AppButton
          label="Generate Test Cases"
          loadingText="Generating..."
          :loading="loading"
          :disabled="!editedPrompt.trim() || totalTestCount === 0"
          @click="$emit('generateTests')"
        />
      </template>
    </div>

    <template v-if="agent">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold">Agent Prompt</h3>
        <span class="text-xs text-base-content/50">{{ agent.businessName }} &middot; {{ agent.language || 'en-US' }}</span>
      </div>

      <textarea
        class="textarea textarea-bordered w-full font-mono text-sm leading-relaxed"
        rows="18"
        :value="editedPrompt"
        :disabled="applied"
        @input="$emit('updatePrompt', $event.target.value)"
      ></textarea>

      <div class="h-6 mt-1">
        <div v-if="promptModified" class="flex items-center gap-1.5 text-xs text-warning">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          Prompt modified from original
        </div>
      </div>

      <div class="mt-5" v-if="agent.actions && agent.actions.length">
        <h3 class="flex items-center gap-1.5 text-sm font-semibold mb-2.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L3.34 8.09a1.5 1.5 0 010-2.12l.88-.88a1.5 1.5 0 012.12 0l4.08 4.08m0 0l1.415-1.414a2.121 2.121 0 013 0l.708.707a2.121 2.121 0 010 3l-1.415 1.414m0 0l4.08 4.08a1.5 1.5 0 010 2.12l-.88.88a1.5 1.5 0 01-2.12 0l-4.08-4.08" /></svg>
          Configured Tools ({{ agent.actions.length }})
        </h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="action in agent.actions" :key="action.id" class="border border-base-300 rounded-lg px-3 py-2 bg-base-100 min-w-[180px]">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-sm font-semibold">{{ action.name }}</span>
              <span class="badge badge-primary badge-sm lowercase">{{ action.actionType.replace(/_/g, ' ') }}</span>
            </div>
            <p v-if="action.actionParameters?.description" class="text-xs text-base-content/50 leading-snug m-0">{{ action.actionParameters.description }}</p>
          </div>
        </div>
      </div>
      <div class="mt-5" v-else-if="agent">
        <p class="text-[13px] text-base-content/50 m-0">No tools configured on this agent.</p>
      </div>
    </template>
  </div>
</template>

<script>
import AppDropdown from './AppDropdown.vue';
import AppButton from './AppButton.vue';

export default {
  name: 'AgentSelector',
  components: { AppDropdown, AppButton },
  props: {
    agents: { type: Array, default: () => [] },
    selectedAgentId: { type: String, default: '' },
    agent: { type: Object, default: null },
    applied: { type: Boolean, default: false },
    categoryCounts: { type: Object, default: () => ({ red: 2, blue: 2, biased: 1, general: 1 }) },
    totalTestCount: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
    editedPrompt: { type: String, default: '' },
    promptModified: { type: Boolean, default: false },
  },
  emits: ['selectAgent', 'updateCategoryCount', 'updatePrompt', 'generateTests'],
  computed: {
    agentOptions() {
      return this.agents.map((a) => ({ value: a.id, label: a.agentName }));
    },
    categories() {
      return [
        { key: 'red', label: 'Red', badgeClass: 'bg-error/15 text-error' },
        { key: 'blue', label: 'Blue', badgeClass: 'bg-info/15 text-info' },
        { key: 'biased', label: 'Biased', badgeClass: 'bg-warning/15 text-warning' },
        { key: 'general', label: 'General', badgeClass: 'bg-base-content/10 text-base-content/70' },
      ];
    },
  },
  methods: {
    onAgentSelect(agentId) {
      if (agentId) {
        this.$emit('selectAgent', agentId);
      }
    },
  },
};
</script>
