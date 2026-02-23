<template>
  <div v-if="store.optimization" class="max-w-[960px]">
    <div class="mb-5">
      <h2 class="text-xl font-semibold mb-1">Prompt Optimization</h2>
      <p class="text-sm text-base-content/60 leading-relaxed">{{ store.optimization.changesSummary }}</p>
    </div>

    <div class="flex flex-col gap-2.5 mb-6">
      <div v-for="(c, i) in store.optimization.changes" :key="i" class="card card-bordered card-compact bg-base-100">
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
      <div class="flex-1 min-w-0">
        <div class="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-t-lg bg-error/10 text-error">Original</div>
        <pre class="diff-content" v-html="originalHtml"></pre>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-t-lg bg-success/10 text-success">Optimized</div>
        <pre class="diff-content" v-html="optimizedHtml"></pre>
      </div>
    </div>

    <div class="sticky -bottom-6 flex gap-3 py-4 border-t border-base-300 bg-base-100">
      <AppButton
        label="Re-run Failed Tests"
        loadingText="Running..."
        :loading="store.loading"
        @click="rerunFailed"
      />
      <AppButton
        label="Re-run All Tests"
        loadingText="Running..."
        :loading="store.loading"
        variant="secondary"
        @click="rerunAll"
      />
    </div>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';
import { diffWords } from 'diff';
import AppButton from './AppButton.vue';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  name: 'OptimizationView',
  components: { AppButton },
  setup() {
    const store = useCopilotStore();
    return { store };
  },
  methods: {
    rerunFailed() {
      this.store.step = 'test';
      this.$nextTick(() => this.store.runRemainingTests());
    },
    rerunAll() {
      this.store.testResults = new Array(this.store.testCases.length).fill(null);
      this.store.step = 'test';
      this.$nextTick(() => this.store.runRemainingTests());
    },
  },
  computed: {
    diffParts() {
      if (!this.store.optimization) return [];
      const before = this.store.promptSnapshotAtRun || this.store.originalPrompt;
      return diffWords(before, this.store.optimization.optimizedPrompt);
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
.diff-content {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  background: oklch(var(--b2));
  border: 1px solid oklch(var(--b3));
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 14px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 500px;
  overflow-y: auto;
}
.diff-content :deep(.diff-removed) {
  background: rgba(220, 38, 38, 0.15);
  color: #991b1b;
  text-decoration: line-through;
  border-radius: 2px;
  padding: 0 2px;
}
.diff-content :deep(.diff-added) {
  background: rgba(22, 163, 74, 0.15);
  color: #166534;
  border-radius: 2px;
  padding: 0 2px;
}
</style>
