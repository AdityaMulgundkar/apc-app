<template>
  <div class="max-w-[600px]">
    <div class="flex items-center gap-4 mb-7">
      <h2 class="text-xl font-semibold m-0">{{ store.applied ? 'Prompt Applied' : 'Review & Apply' }}</h2>
      <StatusBadge v-if="store.applied" status="passed" label="Applied" />
    </div>

    <div class="flex items-center gap-6 mb-3">
      <div class="card card-bordered bg-base-200 min-w-[120px] p-5 flex flex-col items-center">
        <span class="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">Baseline</span>
        <span class="text-4xl font-bold" :class="rateClass(store.baselinePassRate)">
          {{ store.baselinePassRate !== null ? store.baselinePassRate + '%' : '—' }}
        </span>
      </div>
      <svg class="w-6 h-6 text-base-content/40 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
      <div class="card card-bordered bg-base-200 min-w-[120px] p-5 flex flex-col items-center">
        <span class="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">Latest</span>
        <span class="text-4xl font-bold" :class="rateClass(store.passRate)">
          {{ store.passRate !== null ? store.passRate + '%' : '—' }}
        </span>
      </div>
    </div>

    <p class="text-sm text-base-content/50 mb-6">Optimized {{ store.iterationCount }} time{{ store.iterationCount !== 1 ? 's' : '' }}</p>

    <div class="overflow-x-auto mb-6">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Test Case</th>
            <th class="text-center w-20">Baseline</th>
            <th class="text-center w-20">Latest</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in store.perTestComparison" :key="row.id">
            <td>
              <span class="text-xs font-bold text-primary uppercase mr-2">{{ row.id }}</span>
              <span class="text-xs truncate">{{ row.scenario }}</span>
            </td>
            <td class="text-center">
              <span v-if="row.baselinePassed === null" class="text-sm font-bold text-base-content/40">—</span>
              <svg v-else-if="row.baselinePassed" class="w-[18px] h-[18px] text-success inline-block" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <svg v-else class="w-[18px] h-[18px] text-error inline-block" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </td>
            <td class="text-center">
              <span v-if="row.latestPassed === null" class="text-sm font-bold text-base-content/40">—</span>
              <svg v-else-if="row.latestPassed" class="w-[18px] h-[18px] text-success inline-block" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <svg v-else class="w-[18px] h-[18px] text-error inline-block" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="sticky -bottom-6 py-4 border-t border-base-300 bg-base-100">
      <AppButton
        v-if="!store.applied"
        label="Apply to Agent"
        loadingText="Applying..."
        :loading="store.loading"
        @click="store.applyOptimizedPrompt()"
      />
      <AppButton
        v-if="store.applied"
        label="Start Over"
        variant="secondary"
        @click="store.reset()"
      />
    </div>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';
import AppButton from './AppButton.vue';
import StatusBadge from './StatusBadge.vue';

export default {
  name: 'ApplyView',
  components: { AppButton, StatusBadge },
  setup() {
    const store = useCopilotStore();
    return { store };
  },
  methods: {
    rateClass(rate) {
      if (rate === null) return '';
      return rate >= 70 ? 'text-success' : 'text-error';
    },
  },
};
</script>
