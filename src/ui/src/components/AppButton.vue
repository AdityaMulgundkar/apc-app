<template>
  <button
    class="btn"
    :class="btnClass"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="loading loading-spinner loading-sm"></span>
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
  computed: {
    btnClass() {
      switch (this.variant) {
        case 'secondary': return 'btn-outline btn-primary';
        case 'success': return 'btn-success';
        case 'error': return 'btn-error';
        default: return 'btn-primary';
      }
    },
  },
};
</script>
