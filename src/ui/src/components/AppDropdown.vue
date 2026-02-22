<template>
  <details class="dropdown" ref="dropdownRef">
    <summary class="app-dropdown-trigger" :style="triggerStyle">
      <span class="app-dropdown-label">{{ selectedLabel || placeholder }}</span>
      <svg class="app-dropdown-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </summary>
    <ul class="dropdown-content menu bg-base-100 rounded-box z-10 p-2 shadow" :style="triggerStyle">
      <li v-for="option in options" :key="option.value">
        <a
          :class="{ 'app-dropdown-active': modelValue === option.value }"
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
.app-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--ghl-text);
  background: #fff;
  border: 1px solid var(--ghl-border);
  border-radius: 8px;
  cursor: pointer;
  list-style: none;
}
.app-dropdown-trigger:hover {
  border-color: var(--ghl-primary);
}
.app-dropdown-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app-dropdown-chevron {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  margin-left: 8px;
}
.app-dropdown-active {
  background: var(--ghl-primary-light) !important;
  color: var(--ghl-primary) !important;
}
:deep(.menu li a:hover),
:deep(.menu li a:focus),
:deep(.menu li a:active) {
  background: var(--ghl-bg-subtle) !important;
  color: var(--ghl-text) !important;
}
:deep(.menu li a.app-dropdown-active:hover) {
  background: var(--ghl-primary-light) !important;
  color: var(--ghl-primary) !important;
}
</style>
