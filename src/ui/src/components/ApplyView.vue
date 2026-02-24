<template>
  <div>
    <div class="flex items-center gap-4 mb-7">
      <h2 class="text-xl font-semibold m-0">{{ applied ? 'Prompt Applied' : 'Review & Apply' }}</h2>
      <span class="badge badge-primary badge-sm px-2.5">{{ testCount }} tests</span>
      <StatusBadge v-if="applied" status="passed" label="Applied" />
    </div>

    <div class="flex items-center gap-6 mb-3">
      <div class="card card-bordered bg-base-100 min-w-[120px] p-5 flex flex-col items-center">
        <span class="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">Baseline</span>
        <span class="text-4xl font-bold" :class="rateClass(baselinePassRate)">
          {{ baselinePassRate !== null ? baselinePassRate + '%' : '—' }}
        </span>
      </div>
      <svg class="w-6 h-6 text-base-content/40 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
      <div class="card card-bordered bg-base-100 min-w-[120px] p-5 flex flex-col items-center">
        <span class="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">Latest</span>
        <span class="text-4xl font-bold" :class="rateClass(passRate)">
          {{ passRate !== null ? passRate + '%' : '—' }}
        </span>
      </div>
    </div>

    <p class="text-sm text-base-content/50 mb-6">Optimized {{ iterationCount }} time{{ iterationCount !== 1 ? 's' : '' }}</p>

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
          <tr v-for="row in perTestComparison" :key="row.id">
            <td>
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-xs font-bold text-primary uppercase flex-shrink-0">{{ row.id }}</span>
                <span class="text-xs truncate">{{ row.scenario }}</span>
              </div>
            </td>
            <td class="text-center">
              <span v-if="row.baselinePassed === null" class="text-sm font-bold text-base-content/40">—</span>
              <ResultIcon v-else :passed="row.baselinePassed" class="w-[18px] h-[18px] inline-block" />
            </td>
            <td class="text-center">
              <span v-if="row.latestPassed === null" class="text-sm font-bold text-base-content/40">—</span>
              <ResultIcon v-else :passed="row.latestPassed" class="w-[18px] h-[18px] inline-block" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="originalPrompt && currentPrompt && originalPrompt !== currentPrompt" class="mb-6">
      <h3 class="text-sm font-semibold mb-3">Prompt Changes</h3>
      <div class="flex gap-4">
        <div class="card card-bordered card-compact flex-1 min-w-0 bg-base-100">
          <div class="card-body p-0">
            <div class="text-xs font-semibold uppercase tracking-wide px-4 py-2 border-b border-base-300 text-error">Original</div>
            <div class="font-mono text-[13px] leading-relaxed p-4 whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto" ref="originalPre" @scroll="syncScroll('original')" v-html="originalHtml"></div>
          </div>
        </div>
        <div class="card card-bordered card-compact flex-1 min-w-0 bg-base-100">
          <div class="card-body p-0">
            <div class="text-xs font-semibold uppercase tracking-wide px-4 py-2 border-b border-base-300 text-success">Optimized</div>
            <div class="font-mono text-[13px] leading-relaxed p-4 whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto" ref="optimizedPre" @scroll="syncScroll('optimized')" v-html="optimizedHtml"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="sticky -bottom-6 py-4 border-t border-base-300 bg-base-100">
      <AppButton
        v-if="!applied"
        label="Apply to Agent"
        loadingText="Applying..."
        :loading="loading"
        @click="$emit('apply')"
      />
      <AppButton
        v-if="applied"
        label="Start Over"
        variant="secondary"
        @click="$emit('reset')"
      />
    </div>
  </div>
</template>

<script>
import { diffWords } from 'diff';
import AppButton from './AppButton.vue';
import StatusBadge from './StatusBadge.vue';
import ResultIcon from './ResultIcon.vue';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  name: 'ApplyView',
  components: { AppButton, StatusBadge, ResultIcon },
  props: {
    applied: { type: Boolean, default: false },
    testCount: { type: Number, default: 0 },
    baselinePassRate: { type: Number, default: null },
    passRate: { type: Number, default: null },
    iterationCount: { type: Number, default: 0 },
    perTestComparison: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    originalPrompt: { type: String, default: '' },
    currentPrompt: { type: String, default: '' },
  },
  emits: ['apply', 'reset'],
  data() {
    return { syncing: false };
  },
  methods: {
    rateClass(rate) {
      if (rate === null) return '';
      return rate >= 70 ? 'text-success' : 'text-error';
    },
    syncScroll(source) {
      if (this.syncing) return;
      this.syncing = true;
      const from = source === 'original' ? this.$refs.originalPre : this.$refs.optimizedPre;
      const to = source === 'original' ? this.$refs.optimizedPre : this.$refs.originalPre;
      if (from && to) {
        to.scrollTop = from.scrollTop;
      }
      this.$nextTick(() => { this.syncing = false; });
    },
  },
  computed: {
    diffParts() {
      return diffWords(this.originalPrompt, this.currentPrompt);
    },
    originalHtml() {
      return this.diffParts
        .filter((p) => !p.added)
        .map((p) =>
          p.removed
            ? `<span class="diff-removed">${escapeHtml(p.value)}</span>`
            : escapeHtml(p.value)
        )
        .join('');
    },
    optimizedHtml() {
      return this.diffParts
        .filter((p) => !p.removed)
        .map((p) =>
          p.added
            ? `<span class="diff-added">${escapeHtml(p.value)}</span>`
            : escapeHtml(p.value)
        )
        .join('');
    },
  },
};
</script>

<style scoped>
:deep(.diff-removed) {
  background: oklch(var(--er) / 0.15);
  color: oklch(var(--er));
  text-decoration: line-through;
  border-radius: 2px;
  padding: 0 2px;
}
:deep(.diff-added) {
  background: oklch(var(--su) / 0.15);
  color: oklch(var(--su));
  border-radius: 2px;
  padding: 0 2px;
}
</style>
