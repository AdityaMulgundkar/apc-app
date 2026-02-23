<template>
  <span class="badge" :class="[colorClass, sizeClass]">{{ label }}</span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: { type: String, required: true },
    label: { type: String, default: '' },
    size: { type: String, default: '' },
  },
  computed: {
    colorClass() {
      switch (this.status) {
        case 'passed': return 'badge-success';
        case 'failed': return 'badge-error';
        default: return 'badge-ghost';
      }
    },
    sizeClass() {
      if (this.size === 'lg') return 'badge-lg';
      if (this.size === 'sm') return 'badge-sm';
      return '';
    },
  },
};
</script>
