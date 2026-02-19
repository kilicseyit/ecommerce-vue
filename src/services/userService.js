import api from './api'

export const userService = {
  getAll() {
    return api.get('/Auth/users')
  }
}