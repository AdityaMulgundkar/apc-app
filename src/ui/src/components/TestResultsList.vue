<template>
  <div class="flex flex-col h-full bg-base-100">
    <div class="flex items-center justify-between px-5 py-4 border-b border-base-300">
      <h3 class="text-sm font-semibold">Results</h3>
      <div class="flex items-center gap-1.5">
        <span class="badge badge-primary badge-sm px-2.5">{{ store.testCases.length }}</span>
        <span
          v-if="store.passRate !== null"
          class="badge badge-sm px-2.5"
          :class="store.passRate >= 70 ? 'badge-success' : 'badge-error'"
        >{{ store.passRate }}%</span>
      </div>
    </div>

    <ul class="flex-1 overflow-y-auto list-none m-0 p-0">
      <li
        v-for="(tc, i) in store.testCases"
        :key="tc.id"
        class="border-b border-base-300 transition-colors"
        :class="[
          i === store.selectedTestIndex
            ? 'bg-primary/10'
            : '',
          store.isTestRun(i) ? 'cursor-pointer hover:bg-primary/5' : 'opacity-40 cursor-not-allowed',
        ]"
        @click="store.isTestRun(i) && store.selectTest(i)"
      >
        <div
          class="flex items-center gap-3 py-3.5 px-5"
        >
          <div v-if="!store.isTestRun(i)" class="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <span class="text-base-content/30 font-bold">—</span>
          </div>
          <div v-else-if="store.testStatus(i) === 'passed'" class="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-success" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <div v-else class="w-5 h-5 rounded-full bg-error/15 flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-error" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-xs font-extrabold text-primary">{{ tc.id }}</span>
            <p class="text-[12px] font-medium leading-snug mt-0.5 m-0 line-clamp-2">{{ tc.scenario }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { useCopilotStore } from '../stores/copilotStore';

export default {
  name: 'TestResultsList',
  setup() {
    const store = useCopilotStore();
    return { store };
  },
};
</script>
