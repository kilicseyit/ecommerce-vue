import api from './api'

export const productService = {
  getAll() {
    return api.get('/Products')
  },

  getById(id) {
    return api.get(`/Products/${id}`)
  },

  create(product) {
    return api.post('/Products', product)
  },

  update(id, product) {
    return api.put(`/Products/${id}`, product)
  },

  delete(id) {
    return api.delete(`/Products/${id}`)
  },
  getMyProducts() {
    return api.get('/Products/my')
  },
  uploadImage(id, formData) {
    return api.post(`/Products/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getMyProducts: () => api.get('/Products/my'),
}