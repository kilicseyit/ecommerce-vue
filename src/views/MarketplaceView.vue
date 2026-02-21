<template>
  <div>
    <div class="page-header">
      <div>
        <h1>🛍️ Pazar Yeri</h1>
        <p class="subtitle">Tüm ürünleri keşfet</p>
      </div>
    </div>

    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" type="text" placeholder="Ürün ara..." />
    </div>

    <div class="filter-bar">
      <button class="btn-filter-toggle" @click="showFilters = !showFilters">
        🔧 Filtrele {{ hasFilters ? '🔴' : '' }}
        <span>{{ showFilters ? '▲' : '▼' }}</span>
      </button>
      <button v-if="hasFilters" class="btn-clear-filter" @click="clearFilters">✕ Temizle</button>
    </div>

    <div v-if="showFilters" class="filters">
      <select v-model="selectedCategory" class="filter-select">
        <option value="">Tüm Kategoriler</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>

      <div class="price-range">
        <input v-model.number="minPrice" type="number" placeholder="Min ₺" class="filter-input" />
        <span class="price-sep">—</span>
        <input v-model.number="maxPrice" type="number" placeholder="Max ₺" class="filter-input" />
      </div>

      <select v-model="sortBy" class="filter-select">
        <option value="">Sıralama</option>
        <option value="price_asc">💰 Fiyat: Düşükten Yükseğe</option>
        <option value="price_desc">💰 Fiyat: Yüksekten Düşüğe</option>
        <option value="rating">⭐ En Yüksek Puan</option>
        <option value="newest">🆕 En Yeni</option>
      </select>

      <label class="filter-check">
        <input type="checkbox" v-model="onlyInStock" />
        Sadece Stokta
      </label>
    </div>

    <p v-if="loading" class="loading">Yükleniyor...</p>

    <div v-else class="product-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card" @click="router.push(`/products/${product.id}`)">
        <div class="card-image">
          <img v-if="product.imageUrl" :src="`${baseURL}${product.imageUrl}`" />
          <div v-else class="no-image">🖼️</div>
          <span v-if="product.discountPercent > 0" class="discount-tag">%{{ product.discountPercent }}</span>
          <button class="btn-fav" @click.stop="toggleFav(product.id)">
            {{ isFavorite(product.id) ? '❤️' : '🤍' }}
          </button>
        </div>
        <div class="card-body">
          <span class="category-badge">{{ product.categoryName }}</span>
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-desc">{{ product.description }}</p>
          <div class="rating">
            <span class="stars">{{ '★'.repeat(Math.round(product.averageRating)) }}{{ '☆'.repeat(5 - Math.round(product.averageRating)) }}</span>
            <span class="rating-count">({{ product.ratingCount }})</span>
          </div>
          <div class="price-row">
            <div>
              <span v-if="product.discountPrice" class="old-price">{{ product.price }} ₺</span>
              <span class="current-price">{{ product.discountPrice ?? product.price }} ₺</span>
            </div>
            <span :class="product.stock > 0 ? 'stock-ok' : 'stock-empty'">
              {{ product.stock > 0 ? 'Stokta' : 'Tükendi' }}
            </span>
          </div>
          <button class="btn-cart" @click.stop="addToCart(product)" :disabled="product.stock <= 0">
            {{ product.stock > 0 ? '🛒 Sepete Ekle' : '❌ Stok Yok' }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="!loading && filteredProducts.length === 0" class="empty">Ürün bulunamadı.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { useToast } from '../stores/toast'
import { baseURL } from '../services/api'
import { useCart } from '../stores/cart'
import { useFavorites } from '../stores/favorites'

const showFilters = ref(false)
const { fetchFavoriteIds, isFavorite, toggleFavorite } = useFavorites()
const router = useRouter()
const { show } = useToast()
const { addToCart: cartAdd } = useCart()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const minPrice = ref(null)
const maxPrice = ref(null)
const sortBy = ref('')
const onlyInStock = ref(false)

const hasFilters = computed(() =>
  selectedCategory.value || minPrice.value || maxPrice.value || sortBy.value || onlyInStock.value
)

function clearFilters() {
  selectedCategory.value = ''
  minPrice.value = null
  maxPrice.value = null
  sortBy.value = ''
  onlyInStock.value = false
}

const filteredProducts = computed(() => {
  let result = products.value

  if (searchQuery.value) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (selectedCategory.value) result = result.filter(p => p.categoryId === selectedCategory.value)
  if (minPrice.value) result = result.filter(p => (p.discountPrice ?? p.price) >= minPrice.value)
  if (maxPrice.value) result = result.filter(p => (p.discountPrice ?? p.price) <= maxPrice.value)
  if (onlyInStock.value) result = result.filter(p => p.stock > 0)
  if (sortBy.value === 'price_asc') result = [...result].sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price))
  if (sortBy.value === 'price_desc') result = [...result].sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price))
  if (sortBy.value === 'rating') result = [...result].sort((a, b) => b.averageRating - a.averageRating)
  if (sortBy.value === 'newest') result = [...result].sort((a, b) => b.id - a.id)

  return result
})

async function toggleFav(productId) { await toggleFavorite(productId) }
function addToCart(product) { cartAdd(product); show(`${product.name} sepete eklendi!`, 'success') }

async function fetchProducts() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      productService.getAll(),
      categoryService.getAll()
    ])
    products.value = productsRes.data
    categories.value = categoriesRes.data
  } catch {
    show('Ürünler yüklenemedi!', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
  fetchFavoriteIds()
})
</script>

<style scoped>
.filter-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
.btn-filter-toggle { padding: 8px 16px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.btn-filter-toggle:hover { border-color: #6366f1; color: #6366f1; }
.filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; padding: 16px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; }
.filter-select { padding: 8px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 13px; cursor: pointer; outline: none; }
.price-range { display: flex; align-items: center; gap: 8px; }
.price-sep { color: var(--text-secondary); }
.filter-input { width: 90px; padding: 8px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 13px; outline: none; }
.filter-check { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-primary); cursor: pointer; }
.btn-clear-filter { padding: 8px 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-clear-filter:hover { background: #ef4444; color: white; }
.filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
.filter-select { padding: 8px 12px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 13px; cursor: pointer; outline: none; }
.price-range { display: flex; align-items: center; gap: 8px; }
.price-sep { color: var(--text-secondary); }
.filter-input { width: 90px; padding: 8px 12px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 13px; outline: none; }
.filter-check { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-primary); cursor: pointer; }
.btn-clear-filter { padding: 8px 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-clear-filter:hover { background: #ef4444; color: white; }
.btn-fav { position: absolute; top: 10px; left: 10px; background: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.btn-cart { width: 100%; padding: 10px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; margin-top: 4px; transition: background 0.15s; }
.btn-cart:hover:not(:disabled) { background: #4f46e5; }
.btn-cart:disabled { background: var(--border); color: var(--text-secondary); cursor: not-allowed; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.search-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 12px 16px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; }
.search-icon { font-size: 18px; }
.search-bar input { flex: 1; background: none; border: none; color: var(--text-primary); font-size: 14px; outline: none; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
.product-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.card-image { position: relative; height: 180px; background: var(--bg); display: flex; align-items: center; justify-content: center; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.no-image { font-size: 48px; }
.discount-tag { position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.card-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.category-badge { background: #f0fdf4; color: #16a34a; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; width: fit-content; }
.product-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.product-desc { font-size: 13px; color: var(--text-secondary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rating { display: flex; align-items: center; gap: 4px; }
.stars { color: #f59e0b; font-size: 13px; }
.rating-count { color: var(--text-secondary); font-size: 12px; }
.price-row { display: flex; justify-content: space-between; align-items: center; }
.current-price { font-size: 16px; font-weight: 700; color: #6366f1; }
.old-price { font-size: 12px; color: var(--text-secondary); text-decoration: line-through; margin-right: 6px; }
.stock-ok { font-size: 12px; color: #22c55e; font-weight: 500; }
.stock-empty { font-size: 12px; color: #ef4444; font-weight: 500; }
.loading, .empty { text-align: center; color: var(--text-secondary); padding: 48px; }
</style>