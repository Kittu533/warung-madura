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

const props = defineProps({
  showLogo: { type: Boolean, default: true },
  showAddButtons: { type: Boolean, default: true }, 
  showCart: { type: Boolean, default: true },
  showUserMenu: { type: Boolean, default: true },
  
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


const cartCount = computed(() => productsStore.cartCount);
const cartTotal = computed(() => productsStore.cartTotal);


const rp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n ?? 0);


const navigateToProductPage = () => router.push("/dashboard/product/index");
const navigateToCategoriesPage = () =>
  router.push("/dashboard/categories/index");

const handleOpenCart = () => {
  emit("open-cart");
  router.push("/dashboard/cart");
};


const hasSearchOrFilter = computed(
  () => props.showSearchBar || props.showCategoryFilter
);
</script>

<template>
  <header class="bg-white rounded-2xl shadow-sm p-4 md:p-5 w-full">
    <!-- === TOP BAR === -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <!-- Logo Section -->
      <div v-if="showLogo" class="flex items-center">
        <AppLogo />
      </div>

      <!-- Action Buttons Section -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap lg:flex-nowrap">
        <!-- Add Buttons Group -->
        <div v-if="showAddButtons" class="flex flex-wrap gap-2">
          <!-- Tambah Kategori -->
          <button
            @click="navigateToCategoriesPage"
            class="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">Tambah Kategori</span>
            <span class="sm:hidden">Kategori</span>
          </button>

          <!-- Tambah Produk -->
          <button
            @click="navigateToProductPage"
            class="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">Tambah Produk</span>
            <span class="sm:hidden">Produk</span>
          </button>
        </div>

        <!-- Right Side Group (Cart + User) -->
        <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <!-- Cart Button -->
          <button
            v-if="showCart"
            @click="handleOpenCart"
            class="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700 transition hover:bg-blue-100"
            title="Lihat Keranjang"
          >
            <div class="relative">
              <div class="bg-blue-600 p-2 rounded-md">
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

              <!-- Badge Count -->
              <span
          v-if="cartCount > 0"
          class="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-600 min-w-[18px] h-[18px] px-1 text-xs font-bold text-white"
              >
          {{ cartCount }}
              </span>
            </div>

            <!-- Total (Hidden on mobile) -->
            <div class="hidden md:flex flex-col items-start">
              <span class="text-xs text-gray-500">Total</span>
              <span class="text-sm font-semibold">{{ rp(cartTotal) }}</span>
            </div>
          </button>

          <!-- Divider (Hidden on mobile) -->
          <div
            v-if="showCart && showUserMenu"
            class="hidden sm:block h-8 border-l border-gray-300"
          ></div>

          <!-- User Menu -->
          <UserProfileMenu v-if="showUserMenu" :user="auth.user" />
        </div>
      </div>
    </div>

    <!-- Divider (hanya tampil kalau ada search/filter) -->
    <hr v-if="hasSearchOrFilter" class="my-4 border-gray-200" />

    <!-- === SEARCH & FILTER BAR === -->
    <div v-if="hasSearchOrFilter" class="flex flex-col gap-3">
      <!-- Search bar -->
      <div v-if="showSearchBar" class="w-full">
        <SearchBar
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          @search="handleSearch"
          :debounce-time="400"
        />
      </div>

      <!-- Category Filter Pills -->
      <div v-if="showCategoryFilter" class="w-full">
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <!-- Button Semua -->
          <button
            @click="handleSelectCategory(null)"
            :class="[
              'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all flex-shrink-0',
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            Semua
          </button>

          <!-- Category Buttons -->
          <button
            v-for="cat in categoriesStore.list"
            :key="cat.id"
            @click="handleSelectCategory(cat.id)"
            :class="[
              'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all flex-shrink-0',
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
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
/* Hide scrollbar for category pills */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>