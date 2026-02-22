<template>
  <button
    class="app-btn"
    :class="{ 'app-btn-secondary': variant === 'secondary' }"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="app-btn-spinner" :class="{ 'app-btn-spinner-outline': variant === 'secondary' }"></span>
    <slot v-else name="icon"></slot>
    {{ loading ? loadingText : label }}
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    label: { type: String, required: true },
    loadingText: { type: String, default: 'Loading...' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    variant: { type: String, default: 'primary' },
  },
  emits: ['click'],
};
</script>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--ghl-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  height: 40px;
  white-space: nowrap;
  transition: background 0.15s;
}
.app-btn:hover {
  background: var(--ghl-primary-hover);
}
.app-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.app-btn-secondary {
  background: transparent;
  color: var(--ghl-primary);
  border: 1px solid var(--ghl-primary);
}
.app-btn-secondary:hover {
  background: var(--ghl-primary-light);
}
.app-btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: app-spin 0.6s linear infinite;
  flex-shrink: 0;
}
.app-btn-spinner-outline {
  border-color: rgba(56, 160, 219, 0.3);
  border-top-color: var(--ghl-primary);
}
@keyframes app-spin {
  to { transform: rotate(360deg); }
}
</style>
