<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useCategoriesStore } from "@/stores/categories.store";
import { useProductsStore } from "@/stores/products.store";
import AppLogo from "@/components/ui/app-logo.vue";
import CategoryFilter from "@/components/app/category-filter.vue";
import SearchBar from "@/components/app/search-bar.vue";
import UserProfileMenu from "@/components/app/user-profile-menu.vue";

const router = useRouter();
const auth = useAuthStore();
const categoriesStore = useCategoriesStore();
const productsStore = useProductsStore();

// ⬅️ Props untuk mengontrol section mana yang ditampilkan
const props = defineProps({
  // Top bar sections
  showLogo: { type: Boolean, default: true },
  showAddButtons: { type: Boolean, default: true }, // Tambah Kategori & Produk
  showCart: { type: Boolean, default: true },
  showUserMenu: { type: Boolean, default: true },
  
  // Search & Filter bar
  showSearchBar: { type: Boolean, default: false },
  showCategoryFilter: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: "Cari nama produk..." },
});

const searchQuery = ref("");
const selectedCategory = ref(null);

const emit = defineEmits(["search", "select-category", "open-cart"]);

const handleSearch = () => emit("search", searchQuery.value);
const handleSelectCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  emit("select-category", categoryId);
};

// Realtime cart (Pinia getters)
const cartCount = computed(() => productsStore.cartCount);
const cartTotal = computed(() => productsStore.cartTotal);

// Formatter Rupiah
const rp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n ?? 0);

// Navigation handlers
const navigateToProductPage = () => router.push("/dashboard/product/index");
const navigateToCategoriesPage = () =>
  router.push("/dashboard/categories/index");

const handleOpenCart = () => {
  emit("open-cart");
  router.push("/dashboard/cart");
};

// Hitung apakah ada section yang ditampilkan
const hasSearchOrFilter = computed(
  () => props.showSearchBar || props.showCategoryFilter
);
</script>

<template>
  <header class="bg-white rounded-2xl shadow-sm p-5 w-full">
    <!-- === TOP BAR === -->
    <div
      class="mb-4 flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center"
    >
      <!-- Logo -->
      <div v-if="showLogo" class="flex items-center gap-2">
        <AppLogo />
      </div>

      <!-- Action Buttons -->
      <div
        class="flex w-full flex-wrap items-center justify-start gap-2 lg:w-auto lg:justify-end"
      >
        <!-- Tambah Kategori -->
        <button
          v-if="showAddButtons"
          @click="navigateToCategoriesPage"
          class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <span>Tambah Kategori</span>
        </button>

        <!-- Tambah Produk -->
        <button
          v-if="showAddButtons"
          @click="navigateToProductPage"
          class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <span>Tambah Produk</span>
        </button>

        <!-- Cart -->
        <button
          v-if="showCart"
          @click="handleOpenCart"
          class="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
          title="Lihat Keranjang"
        >
          <div class="relative">
            <div class="bg-blue-600 py-2 px-3 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.293 2.586A1 1 0 007 17h10a1 1 0 00.894-1.447L17 13M9 21h.01M15 21h.01"
                />
              </svg>
            </div>

            <span
              v-if="cartCount"
              class="absolute -top-2 -right-2 flex items-center justify-center rounded-full bg-green-600 min-w-4 h-4 px-1 text-xs font-semibold text-white"
            >
              {{ cartCount }}
            </span>
          </div>

          <span class="hidden text-sm font-semibold sm:inline mr-2">
            Total Tagihan {{ rp(cartTotal) }}
          </span>
        </button>

        <!-- Divider -->
        <div
          v-if="showCart && showUserMenu"
          class="hidden h-6 border-l sm:block mx-2"
        ></div>

        <!-- User Menu -->
        <UserProfileMenu v-if="showUserMenu" :user="auth.user" />
      </div>
    </div>

    <!-- Divider (hanya tampil kalau ada search/filter) -->
    <hr v-if="hasSearchOrFilter" class="mb-4 border-gray-200" />

    <!-- === SEARCH & FILTER BAR === -->
    <div v-if="hasSearchOrFilter" class="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <!-- Search bar -->
        <div v-if="showSearchBar" class="min-w-[250px] flex-1">
          <SearchBar
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            @search="handleSearch"
            :debounce-time="400"
          />
        </div>

        <!-- Category pills -->
        <div v-if="showCategoryFilter" class="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
          <button
            class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-small text-white transition hover:bg-indigo-200"
            @click="handleSelectCategory(null)"
          >
            Semua
          </button>
          <button
            v-for="cat in categoriesStore.list"
            :key="cat.id"
            @click="handleSelectCategory(cat.id)"
            :class="[
              'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-small transition',
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-blue-700 hover:bg-gray-200',
            ]"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>