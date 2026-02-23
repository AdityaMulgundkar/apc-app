<template>
  <div v-if="loading" class="flex flex-col items-center justify-center h-[300px] gap-3">
    <span class="loading loading-spinner loading-lg text-primary"></span>
    <p class="text-sm text-base-content/50">Running tests...</p>
  </div>

  <div v-else-if="result" class="max-w-[700px]">
    <div class="flex items-start justify-between mb-6">
      <div>
        <span class="text-xs font-bold text-primary uppercase tracking-wide">{{ testCase?.id }}</span>
        <h2 class="text-xl font-semibold mt-1">{{ testCase?.scenario }}</h2>
      </div>
      <StatusBadge
        :status="result.evaluation.overallPass ? 'passed' : 'failed'"
        :label="result.evaluation.overallPass ? 'Passed' : 'Failed'"
      />
    </div>

    <div v-if="stale" class="alert alert-info text-sm mb-4">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
      <span>Prompt has been modified — these results may be outdated</span>
    </div>

    <div class="mb-8 flex flex-col gap-1">
      <div
        v-for="(msg, i) in result.simulation.transcript"
        :key="i"
        class="chat"
        :class="msg.role === 'agent' ? 'chat-start' : 'chat-end'"
      >
        <div class="chat-header text-xs opacity-50 mb-0.5">{{ msg.role === 'agent' ? 'AI Agent' : 'Caller' }}</div>
        <div
          class="chat-bubble text-sm max-w-[85%]"
          :class="msg.role === 'agent' ? 'bg-base-200 text-base-content' : 'chat-bubble-primary'"
          v-html="formatText(msg.content)"
        ></div>
      </div>
    </div>

    <div class="border-t border-base-300 pt-6 mb-6">
      <h3 class="text-sm font-semibold mb-2">Evaluation</h3>
      <p class="text-sm leading-relaxed mb-4">{{ result.evaluation.summary }}</p>

      <div class="flex flex-col gap-2.5">
        <div
          v-for="cr in result.evaluation.criterionResults"
          :key="cr.criterionId"
          class="card card-bordered card-compact bg-base-100"
        >
          <div class="card-body p-3">
            <div class="flex items-center gap-2 mb-1">
              <ResultIcon :passed="cr.passed" class="w-4 h-4 flex-shrink-0" />
              <span class="text-xs font-semibold">{{ cr.criterionId }}</span>
            </div>
            <p class="text-xs text-base-content/60 leading-snug m-0 pl-6">{{ cr.reasoning }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showOptimize" class="sticky -bottom-6 py-4 border-t border-base-300 bg-base-100">
      <AppButton
        label="Optimize Prompt"
        loadingText="Optimizing..."
        :loading="loading"
        @click="$emit('optimize')"
      />
    </div>
  </div>

  <EmptyState v-else>Select a result to view the conversation</EmptyState>
</template>

<script>
import AppButton from './AppButton.vue';
import StatusBadge from './StatusBadge.vue';
import EmptyState from './EmptyState.vue';
import ResultIcon from './ResultIcon.vue';

export default {
  name: 'ConversationView',
  components: { AppButton, StatusBadge, EmptyState, ResultIcon },
  props: {
    testCase: { type: Object, default: null },
    result: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    stale: { type: Boolean, default: false },
    showOptimize: { type: Boolean, default: false },
  },
  emits: ['optimize'],
  methods: {
    formatText(text) {
      let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
      return s;
    },
  },
};
</script>
