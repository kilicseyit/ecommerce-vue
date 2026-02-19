<template>
  <nav class="navbar">
    <div class="navbar-left">
      <span class="logo">🛒 ECommerce</span>
      <button @click="router.push('/products')">Ürünler</button>
      <button @click="router.push('/categories')">Kategoriler</button>
    </div>
    <div class="navbar-right">
      <button class="profile-btn" @click="router.push('/profile')">👤 {{ username }}</button>
      <button class="logout-btn" @click="handleLogout">Çıkış Yap</button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()
const username = computed(() => localStorage.getItem('username') || 'Kullanıcı')

function handleLogout() {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 32px; background: #42b883; color: white; }
.navbar-left { display: flex; align-items: center; gap: 16px; }
.navbar-right { display: flex; align-items: center; gap: 16px; }
.logo { font-size: 20px; font-weight: 700; }
.navbar-left button { padding: 6px 14px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
.navbar-left button:hover { background: rgba(255,255,255,0.35); }
.profile-btn { padding: 6px 14px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
.profile-btn:hover { background: rgba(255,255,255,0.35); }
.logout-btn { padding: 6px 14px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; }
</style>