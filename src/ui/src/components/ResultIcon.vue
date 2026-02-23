<template>
  <svg v-if="passed" :class="['text-success', $attrs.class]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
  <svg v-else :class="['text-error', $attrs.class]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
</template>

<script>
export default {
  name: 'ResultIcon',
  inheritAttrs: false,
  props: {
    passed: { type: Boolean, required: true },
  },
};
</script>
