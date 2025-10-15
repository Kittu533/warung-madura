<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import slide1 from '@/assets/corousel-1.png'

const slides = ref([
  { image: slide1, title: 'Desain yang user-friendly membuat navigasi cepat dan mudah, bahkan bagi pemula.' },
  { image: slide1, title: 'Kelola bisnis Anda dengan mudah dan efisien.' },
  { image: slide1, title: 'Solusi point-of-sale terbaik untuk kemudahan operasional sehari-hari.' }
])

const currentSlide = ref(0)
const isHover = ref(false)
let timer = null
let touchStartX = 0

const nextSlide = () => (currentSlide.value = (currentSlide.value + 1) % slides.value.length)
const prevSlide = () => (currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length)
const goToSlide = (i) => (currentSlide.value = i)

const start = () => {
  stop()
  timer = setInterval(() => {
    if (!isHover.value && !document.hidden) nextSlide()
  }, 5000)
}
const stop = () => timer && (clearInterval(timer), (timer = null))

const onTouchStart = (e) => (touchStartX = e.changedTouches[0].clientX)
const onTouchEnd = (e) => {
  const diff = e.changedTouches[0].clientX - touchStartX
  if (diff > 50) prevSlide()
  else if (diff < -50) nextSlide()
}

onMounted(() => {
  start()
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))
})
onUnmounted(() => stop())
</script>

<template>
  <section
    class="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white"
    role="region"
    aria-roledescription="carousel"
    aria-label="Preview Aplikasi"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- subtle texture -->
    <div
      class="pointer-events-none absolute inset-0 opacity-20"
      style="background-image:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSAyNTUgMjU1IC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==');"
    ></div>

    <!-- konten hero -->
    <div class="relative h-full w-full flex flex-col">
      <!-- kartu preview (tinggi stabil) -->
      <div class="flex-1 grid place-items-center px-6 lg:px-10">
        <div class="relative w-full max-w-[1100px]">
          <div class="relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
            <div class="h-9 bg-gradient-to-b from-white to-neutral-100/70 flex items-center gap-2 px-4">
              <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
            </div>

            <!-- viewport ber-aspek tetap: TIDAK berubah tinggi -->
            <div class="relative overflow-hidden">
              <div
                class="flex will-change-transform transition-transform duration-700 ease-in-out"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
              >
                <div v-for="(s, i) in slides" :key="i" class="w-full flex-shrink-0 relative aspect-[16/9] bg-black/5">
                  <img
                    :src="s.image"
                    :alt="s.title"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    class="w-full h-full object-cover select-none"
                  />
                </div>
              </div>

              <!-- arrows (absolute, tidak mempengaruhi layout) -->
              <button
                class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full grid place-items-center bg-white/20 hover:bg-white/30 ring-1 ring-white/40 backdrop-blur-sm transition"
                @click="prevSlide"
                aria-label="Sebelumnya"
              >
                <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full grid place-items-center bg-white/20 hover:bg-white/30 ring-1 ring-white/40 backdrop-blur-sm transition"
                @click="nextSlide"
                aria-label="Berikutnya"
              >
                <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- caption & dots: tinggi fixed agar tidak “meloncat” -->
      <div class="px-6 lg:px-10 pb-10">
        <h2 class="max-w-[960px] mx-auto text-xl md:text-2xl font-medium leading-relaxed text-white/95 min-h-[56px]">
          {{ slides[currentSlide].title }}
        </h2>
        <div class="mt-4 flex items-center gap-2.5 justify-center">
          <button
            v-for="(s, i) in slides"
            :key="i"
            @click="goToSlide(i)"
            :class="[
              'rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/70',
              currentSlide === i ? 'bg-white w-10 h-2.5' : 'bg-white/40 hover:bg-white/60 w-2.5 h-2.5'
            ]"
            :aria-selected="currentSlide === i"
            :aria-label="`Slide ${i + 1}`"
            role="tab"
          />
        </div>
      </div>
    </div>

    <!-- dekorasi (absolute, tidak memengaruhi flow) -->
    <div class="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-12 -left-10 w-56 h-56 bg-cyan-300/25 rounded-full blur-3xl"></div>
  </section>
</template>
