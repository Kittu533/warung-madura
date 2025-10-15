<script setup>
import { computed } from 'vue'
import { variants, sizes } from './index.js'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (val) => Object.keys(variants).includes(val)
  },
  size: {
    type: String,
    default: 'default',
    validator: (val) => Object.keys(sizes).includes(val)
  },
  disabled: Boolean,
  type: {
    type: String,
    default: 'button'
  }
})

const buttonClasses = computed(() => {
  return [
    'inline-flex items-center justify-center rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants[props.variant],
    sizes[props.size]
  ].join(' ')
})
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>