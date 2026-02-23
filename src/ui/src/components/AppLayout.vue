<template>
  <div class="flex h-screen bg-base-100 font-sans overflow-hidden">
    <!-- Steps Sidebar (collapsible rail) -->
    <nav
      class="sidebar flex flex-col py-6 transition-all duration-200 overflow-hidden"
      :class="sidebarExpanded ? 'w-52' : 'w-14'"
      @mouseenter="sidebarExpanded = true"
      @mouseleave="sidebarExpanded = false"
    >
      <div class="px-3 mb-6 whitespace-nowrap overflow-hidden">
        <svg v-if="!sidebarExpanded" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
        <span v-else class="text-lg font-semibold tracking-tight">APC</span>
      </div>

      <ul class="flex flex-col gap-0.5 flex-1">
        <li
          v-for="s in steps"
          :key="s.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1.5 cursor-pointer transition-colors whitespace-nowrap overflow-hidden"
          :class="stepClasses(s)"
          @click="onStepClick(s)"
          :title="!sidebarExpanded ? s.label : ''"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" v-html="s.iconPath"></svg>
          <span v-show="sidebarExpanded" class="text-sm">{{ s.label }}</span>
          <svg
            v-if="sidebarExpanded && isAccessible(s.id)"
            class="ml-auto w-4 h-4 opacity-40"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
          ><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        </li>
      </ul>

      <div class="px-3 mt-auto whitespace-nowrap overflow-hidden">
        <button
          class="flex items-center gap-3 text-xs opacity-50 hover:opacity-100 transition-opacity"
          @click="openDevCredentials"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
          <span v-show="sidebarExpanded">Dev Credentials</span>
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Middle Panel (only for test/results steps) -->
      <div
        v-if="showMiddlePanel"
        class="w-72 border-r border-base-300 bg-base-200 flex flex-col overflow-hidden"
      >
        <slot name="middle" />
      </div>

      <!-- Right / Main Panel -->
      <div class="flex-1 overflow-y-auto p-6 relative">
        <div v-if="error" class="alert alert-error shadow-sm mb-4">
          <span>{{ error }}</span>
          <button class="btn btn-sm btn-ghost" @click="$emit('clearError')">✕</button>
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>

<script>
const STEPS = [
  { id: 'select', label: 'Select & Review', iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />' },
  { id: 'test', label: 'Test Cases', iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V19a2 2 0 01-2 2H7a2 2 0 01-2-2v-4.5" />' },
  { id: 'results', label: 'Results', iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />' },
  { id: 'optimize', label: 'Optimize', iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />' },
  { id: 'apply', label: 'Apply', iconPath: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-8.42a14.927 14.927 0 00-2.58 5.841m0 0a3 3 0 10-4.243 4.243" />' },
];

export default {
  name: 'AppLayout',
  props: {
    step: { type: String, required: true },
    error: { type: String, default: null },
    accessibleSteps: { type: Array, default: () => [] },
  },
  emits: ['goToStep', 'clearError'],
  data() {
    return {
      sidebarExpanded: false,
      steps: STEPS,
    };
  },
  computed: {
    showMiddlePanel() {
      return this.step === 'test' || this.step === 'results';
    },
  },
  methods: {
    isAccessible(stepId) {
      return this.accessibleSteps.includes(stepId);
    },
    stepClasses(s) {
      const active = s.id === this.step;
      const accessible = this.isAccessible(s.id);
      return {
        'sidebar-active': active,
        'sidebar-accessible': !active && accessible,
        'opacity-30 cursor-not-allowed': !accessible && !active,
      };
    },
    onStepClick(s) {
      if (this.isAccessible(s.id)) {
        this.$emit('goToStep', s.id);
      }
    },
    openDevCredentials() {
      window.open('/dev-credentials', '_blank');
    },
  },
};
</script>

<style scoped>
.sidebar {
  min-width: 3.5rem;
  background: var(--ghl-sidebar-bg);
  color: var(--ghl-sidebar-text);
}
.sidebar-active {
  background: rgba(255, 255, 255, 0.12);
  color: #FFFFFF;
}
.sidebar-accessible:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #FFFFFF;
}
</style>
