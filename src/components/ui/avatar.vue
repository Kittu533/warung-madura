<template>
  <div class="inline-grid place-items-center overflow-hidden rounded-full bg-muted text-muted-foreground"
       :class="size==='sm' ? 'h-8 w-8' : size==='lg' ? 'h-12 w-12' : 'h-10 w-10'">
    <img v-if="src" :src="src" :alt="alt" class="h-full w-full object-cover" />
    <span v-else class="text-sm font-medium">{{ initials }}</span>
  </div>
</template>
<script setup>
const props = defineProps({ src:String, alt:String, name:String, size:{type:String,default:'md'} })
const initials = (props.name||'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
</script>
