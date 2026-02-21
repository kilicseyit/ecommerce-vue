import { ref } from 'vue'
import api from '../services/api'

const notifications = ref([])
const unreadCount = ref(0)

export function useNotifications() {
  async function fetchNotifications() {
    try {
      const res = await api.get('/notifications')
      notifications.value = res.data
      unreadCount.value = res.data.filter(n => !n.isRead).length
    } catch {
      notifications.value = []
    }
  }

  async function markAsRead(id) {
    try {
      await api.put(`/notifications/${id}/read`)
      const n = notifications.value.find(n => n.id === id)
      if (n) { n.isRead = true; unreadCount.value-- }
    } catch {}
  }

  async function markAllAsRead() {
    try {
      await api.put('/notifications/read-all')
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
    } catch {}
  }

  return { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }
}