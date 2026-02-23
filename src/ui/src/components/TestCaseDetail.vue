<template>
  <div v-if="testCase" class="max-w-[640px]">
    <div class="mb-6">
      <span class="text-xs font-bold text-primary uppercase tracking-wide">{{ testCase.id }}</span>
      <h2 class="text-xl font-semibold mt-1">{{ testCase.scenario }}</h2>
    </div>

    <div class="flex gap-4 mb-6">
      <div class="card card-bordered card-compact bg-base-100 flex-1">
        <div class="card-body p-3.5">
          <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            Caller Persona
          </div>
          <p class="text-sm leading-relaxed m-0">{{ testCase.callerPersona }}</p>
        </div>
      </div>

      <div class="card card-bordered card-compact bg-base-100 flex-1">
        <div class="card-body p-3.5">
          <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
            Caller Goal
          </div>
          <p class="text-sm leading-relaxed m-0">{{ testCase.callerGoal }}</p>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h3 class="text-sm font-semibold mb-3">Success Criteria</h3>
      <ul class="flex flex-col gap-2 list-none p-0 m-0">
        <li
          v-for="sc in testCase.successCriteria"
          :key="sc.id"
          class="card card-bordered card-compact bg-base-100"
        >
          <div class="card-body flex-row items-start gap-2.5 p-3">
            <span class="badge badge-primary badge-sm flex-shrink-0 mt-0.5">{{ sc.category }}</span>
            <span class="text-sm leading-snug">{{ sc.description }}</span>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="!applied" class="flex items-center gap-3 pt-2">
      <AppButton
        v-if="!isRun"
        label="Run This Test"
        loadingText="Running..."
        :loading="loading"
        @click="$emit('runSingle')"
      />
      <span
        v-else
        class="btn no-animation cursor-default opacity-60 pointer-events-none"
        :class="status === 'passed' ? 'btn-success' : 'btn-error'"
      >{{ status === 'passed' ? 'Passed' : 'Failed' }}</span>

      <AppButton
        v-if="remainingCount > 0"
        :label="`Run Remaining (${remainingCount})`"
        loadingText="Running..."
        :disabled="loading"
        @click="$emit('runRemaining')"
      />
    </div>
  </div>

  <EmptyState v-else>Select a test case to view details</EmptyState>
</template>

<script>
import AppButton from './AppButton.vue';
import EmptyState from './EmptyState.vue';

export default {
  name: 'TestCaseDetail',
  components: { AppButton, EmptyState },
  props: {
    testCase: { type: Object, default: null },
    status: { type: String, default: 'pending' },
    isRun: { type: Boolean, default: false },
    applied: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    remainingCount: { type: Number, default: 0 },
  },
  emits: ['runSingle', 'runRemaining'],
};
</script>
