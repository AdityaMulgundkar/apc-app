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
        <div class="py-3.5 px-5">
          <div class="flex items-center gap-2 mb-2">
            <span
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :class="{
                'border-2 border-base-content/20': !store.isTestRun(i),
                'bg-success': store.testStatus(i) === 'passed',
                'bg-error': store.testStatus(i) === 'failed',
              }"
            ></span>
            <span class="text-xs font-extrabold text-primary">{{ tc.id }}</span>
            <span class="badge badge-primary badge-outline badge-sm px-2.5 ml-auto">{{ tc.successCriteria?.length || 0 }} criteria</span>
          </div>
          <p class="text-[13px] font-medium leading-snug m-0 line-clamp-2">{{ tc.scenario }}</p>
          <p class="text-[11px] text-base-content/40 mt-1.5 m-0">{{ tc.callerPersona }}</p>
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
