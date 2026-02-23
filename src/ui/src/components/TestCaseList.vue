<template>
  <div class="flex flex-col h-full bg-base-100">
    <div class="flex items-center justify-between px-5 py-4 border-b border-base-300">
      <h3 class="text-sm font-semibold">Test Cases</h3>
      <span class="badge badge-primary badge-sm px-2.5">{{ store.testCases.length }}</span>
    </div>

    <ul class="flex-1 overflow-y-auto list-none m-0 p-0">
      <li
        v-for="(tc, i) in store.testCases"
        :key="tc.id"
        class="border-b border-base-300 cursor-pointer transition-colors"
        :class="i === store.selectedTestIndex
          ? 'bg-primary/10'
          : 'hover:bg-primary/5'"
        @click="store.selectTest(i)"
      >
        <div
          class="py-3.5 px-5"
        >
          <div class="flex items-center gap-2 mb-2">
            <span
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :class="{
                'border-2 border-base-content/20': store.testStatus(i) === 'pending',
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
  name: 'TestCaseList',
  setup() {
    const store = useCopilotStore();
    return { store };
  },
};
</script>
