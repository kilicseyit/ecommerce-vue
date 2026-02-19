import api from './api'

export const categoryService = {
  getAll() {
    return api.get('/Categories')
  },

  create(category) {
    return api.post('/Categories', category)
  },

  delete(id) {
    return api.delete(`/Categories/${id}`)
  }
}