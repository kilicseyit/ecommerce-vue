import api from './api'

export const userService = {
  getAll() {
    return api.get('/Users')
  },
  updateRole(id, role) {
    return api.put(`/Users/${id}/role`, { role })
  },
  delete(id) {
    return api.delete(`/Users/${id}`)
  }
}