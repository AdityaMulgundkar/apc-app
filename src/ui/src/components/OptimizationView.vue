<template>
  <div v-if="optimization" class="max-w-[960px]">
    <div class="mb-5">
      <h2 class="text-xl font-semibold mb-1">Prompt Optimization</h2>
      <p class="text-sm text-base-content/60 leading-relaxed">{{ optimization.changesSummary }}</p>
    </div>

    <div class="flex flex-col gap-2.5 mb-6">
      <div v-for="(c, i) in optimization.changes" :key="i" class="card card-bordered card-compact bg-base-100">
        <div class="card-body p-3 gap-1.5">
          <div class="flex items-start gap-2 text-warning text-sm">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            {{ c.issue }}
          </div>
          <div class="flex items-start gap-2 text-success text-sm">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ c.fix }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-4 mb-6">
      <div class="card card-bordered card-compact flex-1 min-w-0 bg-base-100">
        <div class="card-body p-0">
          <div class="text-xs font-semibold uppercase tracking-wide px-4 py-2 border-b border-base-300 text-error">Original</div>
          <div class="font-mono text-[13px] leading-relaxed p-4 whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto" ref="originalPre" @scroll="syncScroll('original')" v-html="originalHtml"></div>
        </div>
      </div>
      <div class="card card-bordered card-compact flex-1 min-w-0 bg-base-100">
        <div class="card-body p-0">
          <div class="text-xs font-semibold uppercase tracking-wide px-4 py-2 border-b border-base-300 text-success">Optimized</div>
          <div class="font-mono text-[13px] leading-relaxed p-4 whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto" ref="optimizedPre" @scroll="syncScroll('optimized')" v-html="optimizedHtml"></div>
        </div>
      </div>
    </div>

    <div class="sticky -bottom-6 flex gap-3 py-4 border-t border-base-300 bg-base-100">
      <AppButton
        label="Re-run Failed Tests"
        loadingText="Running..."
        :loading="loadingAction === 'failed'"
        :disabled="loadingAction === 'all'"
        @click="$emit('rerunFailed')"
      />
      <AppButton
        label="Re-run All Tests"
        loadingText="Running..."
        :loading="loadingAction === 'all'"
        :disabled="loadingAction === 'failed'"
        variant="secondary"
        @click="$emit('rerunAll')"
      />
    </div>
  </div>
</template>

<script>
import { diffWords } from 'diff';
import AppButton from './AppButton.vue';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  name: 'OptimizationView',
  components: { AppButton },
  props: {
    optimization: { type: Object, default: null },
    loadingAction: { type: String, default: null },
    beforePrompt: { type: String, default: '' },
  },
  emits: ['rerunFailed', 'rerunAll'],
  data() {
    return { syncing: false };
  },
  methods: {
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
      if (!this.optimization) return [];
      return diffWords(this.beforePrompt, this.optimization.optimizedPrompt);
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
