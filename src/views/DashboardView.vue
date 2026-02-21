<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="subtitle">Hoş geldin, {{ username }}! 👋</p>
      </div>
    </div>

    <!-- İstatistik Kartları -->
    <div class="stats-grid">
      <div class="stat-card purple">
        <div class="stat-top">
          <span class="stat-icon">📦</span>
          <span class="stat-value">{{ stats.products }}</span>
        </div>
        <span class="stat-label">Toplam Ürün</span>
      </div>
      <div class="stat-card blue">
        <div class="stat-top">
          <span class="stat-icon">🏷️</span>
          <span class="stat-value">{{ stats.categories }}</span>
        </div>
        <span class="stat-label">Toplam Kategori</span>
      </div>
      <div class="stat-card green">
        <div class="stat-top">
          <span class="stat-icon">✅</span>
          <span class="stat-value">{{ stats.inStock }}</span>
        </div>
        <span class="stat-label">Stokta Olan</span>
      </div>
      <div class="stat-card orange">
  <div class="stat-top">
    <span class="stat-icon">⚠️</span>
    <span class="stat-value">{{ stats.lowStock }}</span>
  </div>
  <span class="stat-label">Az Stok (≤5)</span>
</div>
<div class="stat-card blue2">
  <div class="stat-top">
    <span class="stat-icon">🛍️</span>
    <span class="stat-value">{{ stats.orders }}</span>
  </div>
  <span class="stat-label">Toplam Sipariş</span>
</div>
<div class="stat-card yellow">
  <div class="stat-top">
    <span class="stat-icon">⏳</span>
    <span class="stat-value">{{ stats.pendingOrders }}</span>
  </div>
  <span class="stat-label">Bekleyen Sipariş</span>
</div>
      <div class="stat-card red">
        <div class="stat-top">
          <span class="stat-icon">❌</span>
          <span class="stat-value">{{ stats.outOfStock }}</span>
        </div>
        <span class="stat-label">Stok Tükenen</span>
      </div>
    </div>

    <div class="bottom-grid">
      <!-- Son Eklenen Ürünler -->
      <div class="card">
        <div class="card-header">
          <h2>Son Eklenen Ürünler</h2>
          <button class="btn-link" @click="router.push('/marketplace')">Tümünü Gör →</button>
        </div>
        <div class="product-list">
          <p v-if="loading" class="loading">Yükleniyor...</p>
          <div v-for="product in recentProducts" :key="product.id" class="product-item">
            <div class="product-avatar">{{ product.name.charAt(0) }}</div>
            <div class="product-info">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-category">{{ product.categoryName }}</span>
            </div>
            <div class="product-right">
              <span class="price-badge">{{ product.price }} ₺</span>
              <span :class="product.stock > 0 ? 'stock-ok' : 'stock-empty'">{{ product.stock }} adet</span>
            </div>
          </div>
          <p v-if="!loading && !recentProducts.length" class="empty">Henüz ürün yok.</p>
        </div>
      </div>

      <!-- Kategoriler -->
      <div class="card">
        <div class="card-header">
          <h2>Kategoriler</h2>
          <button class="btn-link" @click="router.push('/categories')">Yönet →</button>
        </div>
        <div class="category-list">
          <div v-for="category in categories" :key="category.id" class="category-item">
            <span class="category-dot">🏷️</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">
              {{ products.filter(p => p.categoryName === category.name).length }} ürün
            </span>
          </div>
          <p v-if="!loading && !categories.length" class="empty">Henüz kategori yok.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { orderService } from '../services/orderService'
import { authService } from '../services/authService'

const isAdmin = computed(() => authService.isAdmin())
const router = useRouter()
const username = computed(() => localStorage.getItem('username') || 'Kullanıcı')
const products = ref([])
const categories = ref([])
const loading = ref(true)
const orders = ref([])
const stats = computed(() => ({
  products: products.value.length,
  categories: categories.value.length,
  inStock: products.value.filter(p => p.stock > 0).length,
  outOfStock: products.value.filter(p => p.stock === 0).length,
  lowStock: products.value.filter(p => p.stock > 0 && p.stock <= 5).length,
  orders: orders.value.length,
  pendingOrders: orders.value.filter(o => o.status === 'Pending').length
}))

const recentProducts = computed(() => {
  return [...products.value]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
})

async function fetchData() {
  try {
    const [productsRes, categoriesRes, ordersRes] = await Promise.all([
      isAdmin.value ? productService.getAll() : productService.getMyProducts(),
      categoryService.getAll(),
      isAdmin.value ? orderService.getAll() : orderService.getMyOrders()
    ])
    products.value = productsRes.data
    categories.value = categoriesRes.data
    orders.value = ordersRes.data
  } finally {
    loading.value = false
  }
}
onMounted(fetchData)
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }

.stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
.stats-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card.blue2 { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-color: #bfdbfe; }
.stat-card.yellow { background: linear-gradient(135deg, #fefce8, #fef9c3); border-color: #fde68a; }


.stat-card { border-radius: 12px; padding: 20px; border: 1px solid var(--border); }
.stat-card.purple { background: linear-gradient(135deg, #eef2ff, #e0e7ff); border-color: #c7d2fe; }
.stat-card.blue { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-color: #bfdbfe; }
.stat-card.green { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: #bbf7d0; }
.stat-card.red { background: linear-gradient(135deg, #fef2f2, #fee2e2); border-color: #fecaca; }
.stat-card.orange { background: linear-gradient(135deg, #fff7ed, #ffedd5); border-color: #fed7aa; }

.stat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.stat-icon { font-size: 24px; }
.stat-value { font-size: 32px; font-weight: 700; color: #1e293b; }
.stat-label { font-size: 13px; color: #64748b; font-weight: 500; }

.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.card { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid var(--border); }
.card-header h2 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.btn-link { background: none; border: none; color: #6366f1; cursor: pointer; font-size: 13px; font-weight: 500; }

.product-list { padding: 8px 0; }
.product-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; transition: background 0.15s; }
.product-item:hover { background: var(--hover); }
.product-avatar { width: 36px; height: 36px; border-radius: 10px; background: #eef2ff; color: #6366f1; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; }
.product-info { flex: 1; display: flex; flex-direction: column; }
.product-name { font-size: 14px; font-weight: 500; color: var(--text-primary); }
.product-category { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.product-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.price-badge { background: #eef2ff; color: #6366f1; padding: 3px 8px; border-radius: 6px; font-weight: 600; font-size: 12px; }
.stock-ok { color: #22c55e; font-size: 12px; font-weight: 500; }
.stock-empty { color: #ef4444; font-size: 12px; font-weight: 500; }

.category-list { padding: 8px 0; }
.category-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; transition: background 0.15s; }
.category-item:hover { background: var(--hover); }
.category-dot { font-size: 18px; }
.category-name { flex: 1; font-size: 14px; font-weight: 500; color: var(--text-primary); }
.category-count { font-size: 12px; color: var(--text-secondary); background: var(--bg); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border); }

.loading, .empty { text-align: center; color: var(--text-secondary); padding: 32px; font-size: 14px; }
</style>