<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      🛒 <span>ECommerce</span>
    </div>

   <nav class="sidebar-nav">
  <router-link to="/dashboard" class="nav-item">
    <span class="icon">📊</span> Dashboard
  </router-link>
  <router-link to="/products" class="nav-item">
    <span class="icon">📦</span> Ürünler
  </router-link>
  <router-link to="/categories" class="nav-item">
    <span class="icon">🏷️</span> Kategoriler
  </router-link>
  <router-link to="/profile" class="nav-item">
    <span class="icon">👤</span> Profilim
  </router-link>
  <router-link to="/orders" class="nav-item">
  <span class="icon">🛍️</span> Siparişler
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
      <button class="logout-btn" @click="handleLogout" title="Çıkış Yap">⏻</button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { useTheme } from '../stores/theme'

const router = useRouter()
const username = computed(() => localStorage.getItem('username') || 'Kullanıcı')
const role = computed(() => localStorage.getItem('role') || 'User')
const isAdmin = computed(() => authService.isAdmin())
const { theme } = useTheme()

function handleLogout() {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
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
}

.nav-item {
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