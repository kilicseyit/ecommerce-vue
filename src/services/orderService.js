import api from './api'

export const orderService = {
  getAll() {
    return api.get('/Orders')
  },

  getById(id) {
    return api.get(`/Orders/${id}`)
  },

  create(order) {
    return api.post('/Orders', order)
  },
  getMySales: () => api.get('/orders/my-sales'),

  updateStatus(id, status) {
    return api.put(`/Orders/${id}/status`, { status })
  },

  delete(id) {
    return api.delete(`/Orders/${id}`)
  },
  getMyOrders: () => api.get('/orders/my'),
  
}