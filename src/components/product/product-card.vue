<script setup>
import { ref } from "vue";
import { useProductsStore } from "@/stores/products.store";
import BaseModal from "@/components/modals/base-modal.vue";

const props = defineProps({
  product: { type: Object, required: true },
  showAdd: { type: Boolean, default: true },
  enableDelete: { type: Boolean, default: true },
});

const emit = defineEmits(["add-to-cart", "delete-product", "deleted"]);

const productsStore = useProductsStore();


const adding = ref(false);
const deleting = ref(false);
const imgBroken = ref(false);
const showDeleteModal = ref(false);

// handlers
const onAddToCart = async () => {
  if (adding.value) return;
  adding.value = true;
  try {
    emit("add-to-cart", props.product);
  } finally {
    adding.value = false;
  }
};
const openDeleteModal = (e) => {
  e?.stopPropagation();
  if (!props.enableDelete) return;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (deleting.value) return;
  deleting.value = true;
  try {
    await productsStore.deleteProduct(props.product.id);
    emit("delete-product", props.product.id);
    emit("deleted", props.product.id);
    showDeleteModal.value = false;
  } catch (err) {
    console.error("Delete product failed:", err);
    alert(typeof err === "string" ? err : "Gagal menghapus produk");
  } finally {
    deleting.value = false;
  }
};

const onImgError = () => {
  imgBroken.value = true;
};
</script>

<template>
  <div
    class="flex flex-col rounded-xl bg-white p-3 shadow transition hover:shadow-md"
  >
    <div class="relative">
      <img
        v-if="!imgBroken && product.picture_url"
        :src="product.picture_url"
        :alt="product.name"
        class="h-40 w-full rounded-md object-cover"
        @error="onImgError"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-40 w-full items-center justify-center rounded-md bg-gray-100 text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M21 19V5a2 2 0 0 0-2-2H5c-1.1 0-2 .9-2 2v14l2-2h14l2 2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"
          />
        </svg>
      </div>

      <button
        v-if="enableDelete"
        type="button"
        @click.stop="openDeleteModal"
        class="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow hover:bg-red-50 hover:text-red-600"
        aria-label="Hapus produk"
        title="Hapus produk"
      >
        <!-- icon trash -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M9 3h6a1 1 0 0 1 1 1v1h4v2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4V5h4V4a1 1 0 0 1 1-1zm8 4H7v12h10V7zM9 9h2v8H9V9zm4 0h2v8h-2V9z"
          />
        </svg>
      </button>
    </div>

    <div class="mt-3 flex flex-1 flex-col">
      <h3 class="truncate font-semibold text-gray-800">
        {{ product.name }}
      </h3>
      <p class="text-sm font-semibold text-green-600">
        {{
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(product.price ?? 0)
        }}
      </p>

      <button
        v-if="showAdd"
        type="button"
        @click="onAddToCart"
        class="mt-auto w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="adding"
        aria-label="Tambah ke keranjang"
      >
        {{ adding ? "Menambahkan..." : "+ Keranjang" }}
      </button>
    </div>

    <!-- Modal konfirmasi delete -->
    <BaseModal
      :show="showDeleteModal"
      title="Hapus Produk"
      :message="`Yakin ingin menghapus produk '${
        product?.name || ''
      }'? Tindakan ini tidak dapat dibatalkan.`"
      mode="confirm"
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="deleting"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
