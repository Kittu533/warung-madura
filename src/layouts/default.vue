<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-[1440px] min-w-[1440px] mx-auto bg-white shadow-lg">
      <slot />
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 1439px) {
  .min-w-\[1440px\] {
    min-width: 100vw;
  }
}
</style>