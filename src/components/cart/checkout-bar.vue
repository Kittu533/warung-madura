<script setup>
import { useCartStore } from '@/stores/cart.store'
import { useTransactionsStore } from '@/stores/transactions.store'
const cart = useCartStore()
const trx = useTransactionsStore()
</script>

<template>
  <div class="sticky bottom-4 flex justify-end">
    <button
      class="px-5 py-3 rounded-2xl bg-green-600 text-white shadow hover:bg-green-500 disabled:opacity-60"
      :disabled="!cart.items.length || trx.loading"
      @click="trx.checkout('POS checkout')"
    >
      {{ trx.loading ? 'Memproses…' : 'Bayar Sekarang' }}
    </button>
  </div>
</template>
