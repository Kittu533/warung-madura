<script setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Cari...'
  },
  debounceTime: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchQuery = ref(props.modelValue)
let debounceTimeout = null

watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

const handleInput = (event) => {
  const value = event.target.value
  
  searchQuery.value = value
  

  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  

  debounceTimeout = setTimeout(() => {

    emit('update:modelValue', value)
    

    if (value.trim().length > 0) {
      emit('search')
    }
  }, props.debounceTime)
}

const handleKeyEnter = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
    debounceTimeout = null
  }
  emit('update:modelValue', searchQuery.value)
  emit('search')
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('update:modelValue', '')
  emit('search')
}
</script>

<template>
  <div class="relative w-full">
    <input
      :value="searchQuery"
      @input="handleInput"
      type="text"
      :placeholder="placeholder"
      @keyup.enter="handleKeyEnter"
      class="w-full px-4 py-2.5 pl-11 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    

    <button
      v-if="searchQuery"
      @click="clearSearch"
      type="button"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
      aria-label="Clear search"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>