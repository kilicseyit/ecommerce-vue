<template>
  <div>
    <div class="page-header">
      <h1>⭐ Favorilerim</h1>
      <p class="subtitle">{{ favorites.length }} favori ürün</p>
    </div>

    <p v-if="loading" class="loading">Yükleniyor...</p>

    <div v-else-if="favorites.length === 0" class="empty">
      <p>⭐ Henüz favori ürününüz yok.</p>
      <button class="btn-primary" @click="router.push('/marketplace')">Ürünleri Keşfet</button>
    </div>

    <div v-else class="product-grid">
      <div v-for="fav in favorites" :key="fav.id" class="product-card">
        <div class="card-image" @click="router.push(`/products/${fav.product.id}`)">
          <img v-if="fav.product.imageUrl" :src="`${baseURL}${fav.product.imageUrl}`" />
          <div v-else class="no-image">🖼️</div>
          <span v-if="fav.product.discountPrice" class="discount-tag">İndirim</span>
        </div>
        <div class="card-body">
          <span class="category-badge">{{ fav.product.categoryName }}</span>
          <h3 class="product-name">{{ fav.product.name }}</h3>
          <div class="price-row">
            <div>
              <span v-if="fav.product.discountPrice" class="old-price">{{ fav.product.price }} ₺</span>
              <span class="current-price">{{ fav.product.discountPrice ?? fav.product.price }} ₺</span>
            </div>
            <span :class="fav.product.stock > 0 ? 'stock-ok' : 'stock-empty'">
              {{ fav.product.stock > 0 ? 'Stokta' : 'Tükendi' }}
            </span>
          </div>
          <div class="card-actions">
            <button class="btn-cart" @click="addToCart(fav.product)" :disabled="fav.product.stock <= 0">
              🛒 Sepete Ekle
            </button>
            <button class="btn-unfav" @click="removeFavorite(fav.productId)">❤️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { favoriteService } from '../services/favoriteService'
import { useFavorites } from '../stores/favorites'
import { useCart } from '../stores/cart'
import { useToast } from '../stores/toast'
import { baseURL } from '../services/api'


const router = useRouter()
const { show } = useToast()
const { favoriteIds, fetchFavoriteIds, isFavorite, toggleFavorite } = useFavorites()
const { addToCart: cartAdd } = useCart()
const favorites = ref([])
const loading = ref(true)

async function fetchFavorites() {
  try {
    const res = await favoriteService.getAll()
    favorites.value = res.data
  } catch {
    show('Favoriler yüklenemedi!', 'error')
  } finally {
    loading.value = false
  }
}

async function removeFavorite(productId) {
  try {
    await favoriteService.remove(productId)
    favorites.value = favorites.value.filter(f => f.productId !== productId)
    favoriteIds.value = favoriteIds.value.filter(id => id !== productId)
    show('Favorilerden kaldırıldı!', 'success')
  } catch {
    show('İşlem başarısız!', 'error')
  }
}

function addToCart(product) {
  cartAdd(product)
  show(`${product.name} sepete eklendi!`, 'success')
}

onMounted(fetchFavorites)
</script>

<style scoped>
.page-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 13px; }
.loading, .empty { text-align: center; padding: 80px; color: var(--text-secondary); }
.empty p { font-size: 18px; margin-bottom: 20px; }
.btn-primary { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
.product-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.card-image { height: 180px; background: var(--bg); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.no-image { font-size: 48px; }
.discount-tag { position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.card-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.category-badge { background: #f0fdf4; color: #16a34a; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; width: fit-content; }
.product-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.price-row { display: flex; justify-content: space-between; align-items: center; }
.current-price { font-size: 16px; font-weight: 700; color: #6366f1; }
.old-price { font-size: 12px; color: var(--text-secondary); text-decoration: line-through; margin-right: 6px; }
.stock-ok { font-size: 12px; color: #22c55e; font-weight: 500; }
.stock-empty { font-size: 12px; color: #ef4444; font-weight: 500; }
.card-actions { display: flex; gap: 8px; }
.btn-cart { flex: 1; padding: 10px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }
.btn-cart:disabled { background: var(--border); color: var(--text-secondary); cursor: not-allowed; }
.btn-unfav { padding: 10px 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
</style>