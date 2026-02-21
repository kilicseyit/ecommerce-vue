import { ref } from 'vue'
import api from '../services/api'

export const unreadMessageCount = ref(0)

export async function fetchUnreadMessageCount() {
  if (!localStorage.getItem('token')) return
  try {
    const res = await api.get('/messages/unread-count')
    unreadMessageCount.value = res.data.count
  } catch {}
}

export function clearUnreadMessageCount() {
  unreadMessageCount.value = 0
}