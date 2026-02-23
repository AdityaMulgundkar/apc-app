<template>
  <details class="dropdown" ref="dropdownRef">
    <summary class="app-trigger btn font-normal" :style="triggerStyle">
      <span class="app-dropdown-label">{{ selectedLabel || placeholder }}</span>
      <svg class="w-3 h-3 ml-2 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </summary>
    <ul class="dropdown-content menu bg-base-100 rounded-box z-10 p-2 shadow" :style="triggerStyle">
      <li v-for="option in options" :key="option.value">
        <a
          :class="modelValue === option.value ? 'active-item' : ''"
          @click="select(option.value)"
        >{{ option.label }}</a>
      </li>
    </ul>
  </details>
</template>

<script>
export default {
  name: 'AppDropdown',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, required: true },
    placeholder: { type: String, default: 'Select...' },
    width: { type: String, default: '16rem' },
  },
  emits: ['update:modelValue'],
  computed: {
    selectedLabel() {
      const match = this.options.find((o) => o.value === this.modelValue);
      return match ? match.label : '';
    },
    triggerStyle() {
      return { width: this.width };
    },
  },
  methods: {
    select(value) {
      this.$emit('update:modelValue', value);
      this.$refs.dropdownRef.removeAttribute('open');
    },
  },
};
</script>

<style scoped>
.app-dropdown-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app-trigger {
  background: #fff !important;
  color: var(--fallback-bc, oklch(var(--bc))) !important;
  border: 1px solid var(--fallback-b3, oklch(var(--b3))) !important;
  justify-content: space-between;
}
.app-trigger:hover,
.app-trigger:focus,
.app-trigger:active {
  background: #fff !important;
  border-color: oklch(var(--p)) !important;
  color: var(--fallback-bc, oklch(var(--bc))) !important;
}
:deep(.menu li > *:not(ul, .menu-title, details, .btn):active),
:deep(.menu li > *:not(ul, .menu-title, details, .btn):hover),
:deep(.menu li > *:not(ul, .menu-title, details, .btn):focus),
:deep(.menu li > *:not(ul, .menu-title, details, .btn).active-item) {
  background: oklch(var(--p) / 0.1) !important;
  color: oklch(var(--p)) !important;
  --tw-bg-opacity: 1 !important;
}
</style>
