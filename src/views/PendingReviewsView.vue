<template>
  <div>
    <div class="page-header">
      <div>
        <h1>💬 Bekleyen Yorumlar</h1>
        <p class="subtitle">Onay bekleyen {{ reviews.length }} yorum</p>
      </div>
    </div>

    <div class="card">
      <p v-if="loading" class="loading">Yükleniyor...</p>

      <table v-else-if="reviews.length">
        <thead>
          <tr>
            <th>Ürün</th>
            <th>Kullanıcı</th>
            <th>Puan</th>
            <th>Yorum</th>
            <th>Tarih</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in reviews" :key="review.id">
            <td class="name-col">{{ review.productName }}</td>
            <td>{{ review.username }}</td>
            <td><span class="stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span></td>
            <td>{{ review.comment }}</td>
            <td>{{ new Date(review.createdAt).toLocaleDateString('tr-TR') }}</td>
            <td>
              <button class="btn-approve" @click="approve(review.id, review.productId)">✅ Onayla</button>
              <button class="btn-delete" @click="deleteReview(review.id, review.productId)">❌ Sil</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty">Bekleyen yorum yok.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productService } from '../services/productService'
import { useToast } from '../stores/toast'
import api from '../services/api'

const { show } = useToast()
const reviews = ref([])
const loading = ref(true)

async function fetchPendingReviews() {
  try {
    const productsRes = await productService.getAll()
    const products = productsRes.data
    const allPending = []

    for (const product of products) {
      const res = await api.get(`/products/${product.id}/reviews/pending`)
      res.data.forEach(r => allPending.push({ ...r, productId: product.id, productName: product.name }))
    }

    reviews.value = allPending
  } catch {
    show('Yorumlar yüklenemedi!', 'error')
  } finally {
    loading.value = false
  }
}

async function approve(reviewId, productId) {
  try {
    await api.put(`/products/${productId}/reviews/${reviewId}/approve`)
    reviews.value = reviews.value.filter(r => r.id !== reviewId)
    show('Yorum onaylandı!', 'success')
  } catch {
    show('Yorum onaylanamadı!', 'error')
  }
}

async function deleteReview(reviewId, productId) {
  try {
    await api.delete(`/products/${productId}/reviews/${reviewId}`)
    reviews.value = reviews.value.filter(r => r.id !== reviewId)
    show('Yorum silindi!', 'success')
  } catch {
    show('Yorum silinemedi!', 'error')
  }
}

onMounted(fetchPendingReviews)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.card { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; color: var(--text-secondary); font-size: 12px; font-weight: 600; text-transform: uppercase; background: var(--bg); border-bottom: 1px solid var(--border); }
td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text-secondary); }
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--hover); }
.name-col { color: var(--text-primary); font-weight: 500; }
.stars { color: #f59e0b; }
.btn-approve { padding: 6px 14px; background: #f0fdf4; color: #16a34a; border: none; border-radius: 6px; cursor: pointer; margin-right: 6px; font-size: 13px; font-weight: 500; }
.btn-delete { padding: 6px 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
.loading, .empty { text-align: center; color: var(--text-secondary); padding: 48px; }
</style>