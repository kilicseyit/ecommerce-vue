import { ref } from 'vue'
import api from '../services/api'
import { authService } from '../services/authService'

export const pendingReviewCount = ref(0)

export async function fetchPendingCount() {
  if (!authService.isAdmin()) return
  try {
    const productsRes = await api.get('/Products')
    const products = productsRes.data
    let count = 0
    for (const product of products) {
      const res = await api.get(`/products/${product.id}/reviews/pending`)
      count += res.data.length
    }
    pendingReviewCount.value = count
  } catch {
    pendingReviewCount.value = 0
  }
}