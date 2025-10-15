<script setup>
import Badge from '@/components/ui/badge.vue'
import { useCartStore } from '@/stores/cart.store'
const cart = useCartStore()
</script>

<template>
  <Badge>
    <span class="opacity-80 mr-1">Total</span>
    Rp {{ cart.total.toLocaleString('id-ID') }} ({{ cart.count }})
  </Badge>
</template>
