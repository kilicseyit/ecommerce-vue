import api from './api'

export const authService = {
  login(credentials) {
    return api.post('/Auth/login', credentials)
  },

  register(userData) {
    return api.post('/Auth/register', userData)
  },

  getProfile() {
    return api.get('/Auth/profile')
  },

  updateProfile(data) {
    return api.put('/Auth/profile', data)
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
  },

  isLoggedIn() {
    return !!localStorage.getItem('token')
  },

  isAdmin() {
    return localStorage.getItem('role') === 'Admin'
  }
}