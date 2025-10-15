<script setup>
import { computed, h, ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/app/app-header.vue";
import DataTable from "@/components/ui/data-table.vue";
import BaseModal from "@/components/modals/base-modal.vue";
import { useProductsStore } from "@/stores/products.store";

const router = useRouter();
const productsStore = useProductsStore();

// ===== Cart state =====
const rows = computed(() => productsStore.cart || []);
const rp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n ?? 0);
const grandTotal = computed(() => productsStore.cartTotal);
const itemCount = computed(() => productsStore.cartCount);

// ===== Qty helpers (client-side) =====
const setQty = (id, qty) => {
  const q = Math.max(1, Number(qty) || 1);
  const idx = productsStore.cart.findIndex((i) => i.id === id);
  if (idx >= 0) {
    productsStore.cart[idx].qty = q;
    productsStore.cart = [...productsStore.cart];
    if (productsStore.persistCart) productsStore.persistCart();
  }
};
const incQty = (id) => {
  const item = productsStore.cart.find((i) => i.id === id);
  if (item) setQty(id, item.qty + 1);
};
const decQty = (id) => {
  const item = productsStore.cart.find((i) => i.id === id);
  if (item) setQty(id, Math.max(1, item.qty - 1));
};
const removeItem = (id) => {
  productsStore.removeFromCart(id);
};

// ===== Table columns =====
const columns = [
  {
    id: "product",
    header: "Produk",
    accessorFn: (row) => row.name,
    enableSorting: true,
    cell: (info) => {
      const p = info.row.original;
      return h("div", { class: "flex items-center" }, [
        h("img", {
          src: p.picture_url || "",
          alt: p.name,
          class:
            "h-12 w-12 rounded-md object-cover flex-shrink-0 bg-gray-100",
          onError: (e) => {
            e.target.style.display = "none";
          },
        }),
        h("div", { class: "ml-3" }, [
          h("div", { class: "text-sm font-medium text-gray-900" }, p.name),
        ]),
      ]);
    },
  },
  {
    id: "price",
    header: "Harga",
    accessorFn: (row) => row.price,
    enableSorting: true,
    cell: (info) => rp(info.row.original.price),
  },
  {
    id: "qty",
    header: "Jumlah",
    enableSorting: false,
    cell: (info) => {
      const p = info.row.original;
      return h("div", { class: "inline-flex items-center gap-2" }, [
        h(
          "button",
          {
            class:
              "rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-50",
            onClick: (e) => {
              e.stopPropagation();
              decQty(p.id);
            },
          },
          "−"
        ),
        h("input", {
          class: "w-14 rounded-md border px-2 py-1 text-center",
          value: String(p.qty),
          onInput: (e) => setQty(p.id, e.target.value),
          onClick: (e) => e.stopPropagation(),
        }),
        h(
          "button",
          {
            class:
              "rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-50",
            onClick: (e) => {
              e.stopPropagation();
              incQty(p.id);
            },
          },
          "+"
        ),
      ]);
    },
  },
  {
    id: "subtotal",
    header: "Sub Total",
    accessorFn: (row) => row.price * row.qty,
    enableSorting: true,
    cell: (info) => {
      const p = info.row.original;
      return h(
        "span",
        { class: "font-semibold text-gray-900" },
        rp(p.price * p.qty)
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    enableSorting: false,
    cell: (info) => {
      const p = info.row.original;
      return h(
        "button",
        {
          class: "text-red-600 hover:text-red-700",
          onClick: (e) => {
            e.stopPropagation();
            removeItem(p.id);
          },
        },
        "Hapus"
      );
    },
  },
];

// ===== Modals =====
const showConfirm = ref(false);
const paying = ref(false);
const showSuccess = ref(false);
const paidAmount = ref(0);
const paidAt = ref("");

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

// Klik tombol "Bayar" di halaman -> buka modal konfirmasi
const openConfirm = () => {
  if (!rows.value.length) return;
  showConfirm.value = true;
};

// Konfirmasi bayar di modal
const confirmPay = async () => {
  if (paying.value) return;
  paying.value = true;

  // simpan total & tanggal SEBELUM clear cart
  paidAmount.value = grandTotal.value;
  paidAt.value = fmtDate(new Date());

  // simulasi proses pembayaran 1.2 detik
  await new Promise((r) => setTimeout(r, 1200));

  // kosongkan keranjang (store kamu sudah persist ke localStorage)
  productsStore.clearCart();

  // tutup confirm, buka success
  showConfirm.value = false;
  showSuccess.value = true;
  paying.value = false;
};

const cancelPay = () => {
  // tidak jadi bayar
  showConfirm.value = false;
};

const closeSuccess = () => {
  showSuccess.value = false;
};

// Kembali
const back = () => router.push("/dashboard/product/index");
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HEADER -->
    <div class="w-full border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <AppHeader />
      </div>
    </div>

    <!-- MAIN -->
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div class="rounded-xl bg-white p-6 shadow-sm">
        <!-- Top bar (Total) -->
        <div
          class="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
        >
          <h1 class="text-2xl font-bold text-gray-800">Cart</h1>
          <div class="flex items-center gap-3">
            <span
              class="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
            >
              {{ itemCount }} item
            </span>
            <span
              class="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
            >
              Total Tagihan {{ rp(grandTotal) }}
            </span>
          </div>
        </div>

        <!-- Tabel Cart -->
        <DataTable
          :data="rows"
          :columns="columns"
          :loading="false"
          :serverMode="false"
          :pageSize="10"
          className="rounded-xl bg-white"
          emptyMessage="Keranjang masih kosong"
        />

        <!-- Footer actions -->
        <div class="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="back"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Kembali
          </button>
          <button
            type="button"
            @click="openConfirm"
            :disabled="!rows.length"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Bayar
          </button>
        </div>
      </div>
    </main>

    <!-- Modal KONFIRMASI BAYAR -->
    <BaseModal
      :show="showConfirm"
      title="Pembayaran"
      mode="confirm"
      size="sm"
      :loading="paying"
      :confirmText="paying ? 'Memproses...' : 'Bayar'"
      :cancelText="'Tidak Jadi'"
      @close="cancelPay"
      @cancel="cancelPay"
      @confirm="confirmPay"
    >
      <div class="p-1 text-center">
        <p class="text-sm text-gray-600 mb-2">Yakin ingin melanjutkan pembayaran?</p>
        <div class="text-sm text-gray-500">Total</div>
        <div class="text-xl font-bold text-gray-900">{{ rp(grandTotal) }}</div>
      </div>
    </BaseModal>

    <!-- Modal SUKSES -->
    <BaseModal
      :show="showSuccess"
      title="Pembayaran Berhasil"
      mode="info"
      size="sm"
      @close="closeSuccess"
    >
      <div class="flex flex-col items-center p-4 text-center">
        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 class="mb-1 text-lg font-semibold text-gray-800">
          Pembayaran Sukses!
        </h3>
        <p class="mb-3 text-sm text-gray-600">Terima kasih atas pembelian Anda.</p>
        <div class="text-sm text-gray-500">Total</div>
        <div class="text-xl font-bold text-gray-900">{{ rp(paidAmount) }}</div>
        <div class="mt-1 text-sm text-gray-500">{{ paidAt }}</div>
      </div>
    </BaseModal>
  </div>
</template>
