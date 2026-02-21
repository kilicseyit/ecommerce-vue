import { ref } from 'vue'
import { favoriteService } from '../services/favoriteService'

const favoriteIds = ref([])

export function useFavorites() {
  async function fetchFavoriteIds() {
    try {
      const res = await favoriteService.getIds()
      favoriteIds.value = res.data
    } catch {
      favoriteIds.value = []
    }
  }

  function isFavorite(productId) {
    return favoriteIds.value.includes(productId)
  }

 async function toggleFavorite(productId) {
  try {
    if (isFavorite(productId)) {
      await favoriteService.remove(productId)
      favoriteIds.value = favoriteIds.value.filter(id => id !== productId)
    } else {
      await favoriteService.add(productId)
      favoriteIds.value.push(productId)
    }
  } catch (e) {
    console.error('Favori işlemi başarısız:', e)
  }
}

  return { favoriteIds, fetchFavoriteIds, isFavorite, toggleFavorite }
}