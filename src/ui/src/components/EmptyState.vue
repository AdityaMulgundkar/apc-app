<template>
  <div class="flex items-center justify-center h-[200px] text-base-content/50 text-sm">
    <p><slot>No data to display</slot></p>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
};
</script>
