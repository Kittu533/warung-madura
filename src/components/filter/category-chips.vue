<script setup>
const props = defineProps({ items:Array, modelValue:[String,Number,null] })
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex gap-2 overflow-auto no-scrollbar">
    <button
      :class="['px-3 py-1.5 rounded-full text-sm ring-1',
               modelValue===null ? 'bg-primary text-primary-foreground ring-transparent'
                                 : 'bg-secondary text-secondary-foreground ring-border hover:bg-blue-50']"
      @click="$emit('update:modelValue', null)">Semua</button>

    <button v-for="c in items" :key="c.id"
      :class="['px-3 py-1.5 rounded-full text-sm ring-1',
               modelValue===c.id ? 'bg-primary text-primary-foreground ring-transparent'
                                 : 'bg-secondary text-secondary-foreground ring-border hover:bg-blue-50']"
      @click="$emit('update:modelValue', c.id)">{{ c.name }}</button>
  </div>
</template>
