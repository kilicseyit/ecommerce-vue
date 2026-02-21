import api from './api'

export const favoriteService = {
  getAll: () => api.get('/favorites'),
  getIds: () => api.get('/favorites/ids'),
  add: (productId) => api.post(`/favorites/${productId}`),
  remove: (productId) => api.delete(`/favorites/${productId}`)
}