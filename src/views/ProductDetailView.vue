<template>
  <div>
    <div class="page-header">
      <button class="btn-back" @click="router.push('/products')">← Geri Dön</button>
      <button v-if="isAdmin" class="btn-edit" @click="router.push(`/products/edit/${product?.id}`)">Düzenle</button>
    </div>

    <p v-if="loading" class="loading">Yükleniyor...</p>

    <div v-else class="detail-layout">
      <!-- Sol: Görsel -->
      <div class="image-card">
        <img v-if="product.imageUrl" :src="`${baseURL}${product.imageUrl}`" class="product-image" />
        <div v-else class="no-image">🖼️</div>
      </div>

      <!-- Sağ: Bilgiler -->
      <div class="info-card">
        <span class="category-badge">{{ product.categoryName }}</span>
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-desc">{{ product.description }}</p>

        <div class="price-section">
          <span v-if="product.discountPrice" class="old-price">{{ product.price }} ₺</span>
          <span class="current-price">{{ product.discountPrice ?? product.price }} ₺</span>
          <span v-if="product.discountPercent > 0" class="discount-badge">%{{ product.discountPercent }} İndirim</span>
        </div>

        <div class="stock-section">
          <span :class="product.stock > 0 ? 'stock-ok' : 'stock-empty'">
            {{ product.stock > 0 ? `✅ Stokta (${product.stock} adet)` : '❌ Stok yok' }}
          </span>
        </div>

        <div class="rating-section">
          <span class="stars">{{ starDisplay }}</span>
          <span class="rating-text">{{ product.averageRating.toFixed(1) }} / 5 ({{ product.ratingCount }} değerlendirme)</span>
        </div>

        <div class="seller-section">
          <span class="seller-icon">🏪</span>
          <div class="seller-info">
            <span class="seller-name">{{ product.sellerUsername }}</span>
            <span class="seller-sales">{{ product.sellerTotalSales }} satış</span>
          </div>
          <button class="btn-message" @click="messageToSeller">💬 Mesaj At</button>
        </div>

        <div class="action-buttons">
          <button class="btn-cart" @click="addToCart(product)" :disabled="product.stock <= 0">
            {{ product.stock > 0 ? '🛒 Sepete Ekle' : '❌ Stok Yok' }}
          </button>
          <button class="btn-fav" @click="toggleFav(product.id)">
            {{ isFavorite(product.id) ? '❤️ Favorilerde' : '🤍 Favoriye Ekle' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Değerlendirmeler -->
    <div v-if="!loading" class="reviews-card">
      <h3>Değerlendirmeler</h3>

      <div class="add-review">
        <div class="star-select">
          <span v-for="n in 5" :key="n" @click="reviewForm.rating = n" class="star" :class="{ active: n <= reviewForm.rating }">★</span>
        </div>
        <input v-model="reviewForm.comment" type="text" placeholder="Yorumunuzu yazın..." />
        <button class="btn-primary" @click="submitReview">Gönder</button>
      </div>

      <div v-if="reviews.length" class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <span class="review-user">👤 {{ review.username }}</span>
            <span v-if="review.isAdmin" class="admin-badge">👑 Admin</span>
            <span class="review-stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
            <span class="review-date">{{ new Date(review.createdAt).toLocaleDateString('tr-TR') }}</span>
            <button v-if="isAdmin" class="btn-delete-review" @click="deleteReview(review.id)">✕</button>
          </div>
          <p class="review-comment">{{ review.comment }}</p>
        </div>
      </div>
      <p v-else class="empty">Henüz değerlendirme yok.</p>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productService } from '../services/productService'
import { authService } from '../services/authService'
import { useToast } from '../stores/toast'
import api from '../services/api'
import { baseURL } from '../services/api'
import { useFavorites } from '../stores/favorites'
import { useCart } from '../stores/cart'

async function messageToSeller() {
  try {
    await api.post(`/messages/${product.value.userId}`, { content: '👋 Merhaba!' })
    router.push(`/messages?userId=${product.value.userId}&username=${product.value.sellerUsername}`)
  } catch {
    show('Mesaj gönderilemedi!', 'error')
  }
}
const { addToCart: cartAdd } = useCart()

function addToCart(product) {
  cartAdd(product)
  show(`${product.name} sepete eklendi!`, 'success')
}
const { fetchFavoriteIds, isFavorite, toggleFavorite } = useFavorites()

async function toggleFav(productId) {
  await toggleFavorite(productId)
}

onMounted(fetchFavoriteIds)

const router = useRouter()
const route = useRoute()
const { show } = useToast()
const isAdmin = computed(() => authService.isAdmin())
const loading = ref(true)
const product = ref(null)
const reviews = ref([])
const reviewForm = ref({ rating: 5, comment: '' })

const starDisplay = computed(() => {
  if (!product.value) return ''
  const full = Math.round(product.value.averageRating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
})

async function fetchProduct() {
  try {
    const response = await productService.getById(route.params.id)
    product.value = response.data
  } catch {
    show('Ürün yüklenemedi!', 'error')
  } finally {
    loading.value = false
  }
}

async function fetchReviews() {
  try {
    const response = await api.get(`/products/${route.params.id}/reviews`)
    reviews.value = response.data
  } catch {
    show('Yorumlar yüklenemedi!', 'error')
  }
}

async function submitReview() {
  try {
    await api.post(`/products/${route.params.id}/reviews`, reviewForm.value)
    show('Yorumunuz eklendi!', 'success')
    reviewForm.value = { rating: 5, comment: '' }
    await fetchReviews()
    await fetchProduct()
  } catch (err) {
    show(err.response?.data || 'Yorum eklenemedi!', 'error')
  }
}

async function deleteReview(id) {
  try {
    await api.delete(`/products/${route.params.id}/reviews/${id}`)
    reviews.value = reviews.value.filter(r => r.id !== id)
    show('Yorum silindi!', 'success')
  } catch {
    show('Yorum silinemedi!', 'error')
  }
}

onMounted(async () => {
  await fetchProduct()
  await fetchReviews()
})
</script>
<style scoped>
.btn-message { margin-left: auto; padding: 6px 14px; background: #eef2ff; color: #6366f1; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-message:hover { background: #6366f1; color: white; transition: all 0.15s; }
.action-buttons { display: flex; gap: 10px; margin-top: 8px; }
.btn-cart { flex: 1; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
.btn-cart:disabled { background: var(--border); color: var(--text-secondary); cursor: not-allowed; }
.btn-fav { padding: 12px 16px; background: #fef2f2; color: #ef4444; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
.seller-section { display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--bg); border-radius: 8px; border: 1px solid var(--border); }
.seller-icon { font-size: 24px; }
.seller-info { display: flex; flex-direction: column; gap: 2px; }
.seller-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.seller-sales { font-size: 12px; color: var(--text-secondary); }
.admin-review { border-left: 3px solid #6366f1; background: rgba(99, 102, 241, 0.05); }
.admin-badge { background: #eef2ff; color: #6366f1; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.btn-back { padding: 8px 16px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-edit { padding: 8px 16px; background: #eef2ff; color: #6366f1; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
.loading { text-align: center; color: var(--text-secondary); padding: 48px; }
.detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.image-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 300px; }
.product-image { width: 100%; max-height: 350px; object-fit: contain; border-radius: 8px; }
.no-image { font-size: 80px; }
.info-card { background: var(--card-bgr); border: 1px solid var(--border); border-radius: 12px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
.category-badge { background: #f0fdf4; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; width: fit-content; }
.product-name { font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0; }
.product-desc { color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin: 0; }
.price-section { display: flex; align-items: center; gap: 12px; }
.current-price { font-size: 28px; font-weight: 700; color: #6366f1; }
.old-price { font-size: 18px; color: var(--text-secondary); text-decoration: line-through; }
.discount-badge { background: #fef2f2; color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; }
.stock-section { font-size: 14px; }
.stock-ok { color: #22c55e; font-weight: 600; }
.stock-empty { color: #ef4444; font-weight: 600; }
.rating-section { display: flex; align-items: center; gap: 8px; }
.stars { color: #f59e0b; font-size: 20px; }
.rating-text { color: var(--text-secondary); font-size: 14px; }
.reviews-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 28px; }
.reviews-card h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 20px 0; }
.add-review { display: flex; gap: 10px; align-items: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
.add-review input { flex: 1; padding: 10px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; }
.star-select { display: flex; gap: 4px; }
.star { font-size: 24px; color: var(--border); cursor: pointer; transition: color 0.15s; }
.star.active { color: #f59e0b; }
.btn-primary { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; white-space: nowrap; }
.review-list { display: flex; flex-direction: column; gap: 16px; }
.review-item { background: var(--bg); border-radius: 10px; padding: 16px; }
.review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.review-user { font-weight: 600; color: var(--text-primary); font-size: 14px; }
.review-stars { color: #f59e0b; font-size: 14px; }
.review-date { color: var(--text-secondary); font-size: 12px; margin-left: auto; }
.btn-delete-review { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; padding: 0 4px; }
.review-comment { color: var(--text-secondary); font-size: 14px; margin: 0; line-height: 1.5; }
.empty { text-align: center; color: var(--text-secondary); padding: 24px; }
</style>