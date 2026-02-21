<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      🛒 <span>ECommerce</span>
    </div>

   <nav class="sidebar-nav">
  <router-link to="/dashboard" class="nav-item">
  <span class="icon">📊</span> Dashboard
</router-link>
<router-link to="/marketplace" class="nav-item">
  <span class="icon">🛒</span> Pazar Yeri
</router-link>
<router-link to="/my-products" class="nav-item">
  <span class="icon">📦</span> Ürünlerim
</router-link>
<router-link to="/orders" class="nav-item">
  <span class="icon">📦</span> Siparişlerim
</router-link>
<router-link to="/categories" class="nav-item">
  <span class="icon">🏷️</span> Kategoriler
</router-link>
<router-link to="/profile" class="nav-item">
  <span class="icon">👤</span> Profilim
</router-link>
<router-link v-if="isAdmin" to="/users" class="nav-item">
  <span class="icon">⚙️</span> Kullanıcılar
</router-link>
<router-link v-if="isAdmin" to="/products" class="nav-item">
  <span class="icon">🗂️</span> Tüm Ürünler (Admin)
</router-link>
<router-link v-if="isAdmin" to="/pending-reviews" class="nav-item">
  <span class="icon">💬</span> Bekleyen Yorumlar
  <span v-if="pendingReviewCount > 0" class="badge">{{ pendingReviewCount }}</span>
</router-link>
<router-link to="/cart" class="nav-item">
  <span class="icon">🛒</span> Sepetim
  <span v-if="totalItems > 0" class="badge">{{ totalItems }}</span>
</router-link>
<router-link to="/statistics" class="nav-item">
  <span class="icon">📊</span> İstatistikler
</router-link>
<router-link to="/favorites" class="nav-item">
  <span class="icon">⭐</span> Favorilerim
</router-link>
<router-link to="/messages" class="nav-item">
  <span class="icon">💬</span> Mesajlar
  <span v-if="unreadMessageCount > 0" class="badge">{{ unreadMessageCount }}</span>
</router-link>

</nav>
    <div class="theme-toggle">
      <span class="theme-label">Tema</span>
      <div class="toggle-buttons">
        <button :class="{ active: theme === 'light' }" @click="theme = 'light'">☀️ Açık</button>
        <button :class="{ active: theme === 'dark' }" @click="theme = 'dark'">🌙 Koyu</button>
      </div>
    </div>

    <div class="sidebar-footer">
  <div class="user-info">
    <div class="avatar">{{ username.charAt(0).toUpperCase() }}</div>
    <div class="user-details">
      <span class="username">{{ username }}</span>
      <span class="role" :class="role === 'Admin' ? 'role-admin' : 'role-user'">
        {{ role === 'Admin' ? '👑 Admin' : '👤 User' }}
      </span>
    </div>
  </div>

  <!-- Bildirim Zili -->
  <div class="notification-bell" @click="toggleNotifications">
    <span>🔔</span>
    <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
  </div>

  <button class="logout-btn" @click="handleLogout" title="Çıkış Yap">⏻</button>
</div>

<!-- Bildirim Paneli -->
<div v-if="showNotifications" class="notification-panel">
  <div class="notification-header">
    <span>Bildirimler</span>
    <button @click="markAllAsRead">Tümünü Oku</button>
  </div>
  <div v-if="notifications.length === 0" class="notification-empty">Bildirim yok</div>
  <div v-for="n in notifications" :key="n.id"
       :class="['notification-item', { unread: !n.isRead }]"
       @click="markAsRead(n.id)">
    <div class="notification-title">{{ n.title }}</div>
    <div class="notification-message">{{ n.message }}</div>
    <div class="notification-time">{{ new Date(n.createdAt).toLocaleDateString('tr-TR') }}</div>
  </div>
</div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { useTheme } from '../stores/theme'
import { pendingReviewCount, fetchPendingCount } from '../stores/badge'
import { useCart } from '../stores/cart'
import { useNotifications } from '../stores/notifications'
import api from '../services/api'
import { unreadMessageCount, fetchUnreadMessageCount } from '../stores/messages'

fetchUnreadMessageCount()
setInterval(fetchUnreadMessageCount, 30000)

onMounted(fetchPendingCount)

const router = useRouter()
const username = computed(() => localStorage.getItem('username') || 'Kullanıcı')
const role = computed(() => localStorage.getItem('role') || 'User')
const isAdmin = computed(() => authService.isAdmin())
const { theme } = useTheme()
const { totalItems } = useCart()
const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()
const showNotifications = ref(false)

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) fetchNotifications()
}

async function fetchUnreadMessages() {
  try {
    const res = await api.get('/messages/unread-count')
    unreadMessageCount.value = res.data.count
  } catch {}
}

fetchNotifications()
fetchUnreadMessages()
setInterval(fetchNotifications, 30000)
setInterval(fetchUnreadMessages, 30000)

function handleLogout() {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.notification-bell { position: relative; cursor: pointer; padding: 8px; font-size: 18px; }
.notif-badge { position: absolute; top: 2px; right: 2px; background: #ef4444; color: white; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 20px; min-width: 16px; text-align: center; }
.notification-panel { position: absolute; bottom: 70px; left: 12px; right: 12px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 100; overflow: hidden; max-height: 400px; overflow-y: auto; }
.notification-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border); font-weight: 600; color: var(--text-primary); font-size: 13px; }
.notification-header button { background: none; border: none; color: #6366f1; cursor: pointer; font-size: 12px; }
.notification-item { padding: 12px 16px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
.notification-item:hover { background: var(--hover); }
.notification-item.unread { border-left: 3px solid #6366f1; background: rgba(99,102,241,0.05); }
.notification-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.notification-message { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.notification-time { font-size: 11px; color: var(--text-secondary); margin-top: 4px; }
.notification-empty { padding: 24px; text-align: center; color: var(--text-secondary); font-size: 13px; }
.badge { margin-left: auto; flex-shrink: 0; background: #ef4444; color: white; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 20px; min-width: 20px; text-align: center; }
.role-admin { color: #f59e0b !important; }
.role-user { color: #94a3b8; }
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-logo {
  padding: 24px 20px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-logo span { color: #6366f1; }

.sidebar-nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.nav-item {
  flex-wrap: nowrap; 
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
}

.nav-item:hover { background: var(--hover); color: var(--text-primary); }
.nav-item.router-link-active { background: #eef2ff; color: #6366f1; font-weight: 600; }

.icon { font-size: 16px; }

.theme-toggle {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.theme-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 8px;
}

.toggle-buttons { display: flex; gap: 6px; }

.toggle-buttons button {
  flex: 1;
  padding: 6px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.toggle-buttons button.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info { flex: 1; display: flex; align-items: center; gap: 10px; }

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #eef2ff;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.user-details { display: flex; flex-direction: column; }
.username { color: var(--text-primary); font-size: 13px; font-weight: 600; }
.role { color: var(--text-secondary); font-size: 11px; }

.logout-btn {
  padding: 8px;
  background: var(--hover);
  color: #ef4444;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.15s;
}

.logout-btn:hover { background: #ef4444; color: white; }
</style>