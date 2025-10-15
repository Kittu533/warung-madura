<template>
  <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-border"
        :class="variant==='primary' ? 'bg-primary text-primary-foreground ring-transparent'
              : variant==='soft' ? 'bg-blue-50 text-blue-800 ring-blue-100'
              : 'bg-secondary text-secondary-foreground'">
    <slot />
  </span>
</template>
<script setup>
defineProps({ variant: { type: String, default: 'soft' } })
</script>
