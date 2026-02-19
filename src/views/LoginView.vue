<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">🛒</div>
        <h1>ECommerce</h1>
        <p>Admin Paneline Hoş Geldin</p>
      </div>

      <div class="tabs">
        <button :class="{ active: tab === 'login' }" @click="tab = 'login'">Giriş Yap</button>
        <button :class="{ active: tab === 'register' }" @click="tab = 'register'">Kayıt Ol</button>
      </div>

      <form v-if="tab === 'login'" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input v-model="loginForm.email" type="email" placeholder="ornek@email.com" required />
        </div>
        <div class="form-group">
          <label>Şifre</label>
          <input v-model="loginForm.password" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="loginError" class="error">{{ loginError }}</p>
        <button type="submit" class="submit-btn">Giriş Yap →</button>
      </form>

      <form v-if="tab === 'register'" @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Kullanıcı Adı</label>
          <input v-model="registerForm.username" type="text" placeholder="kullanici_adi" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="registerForm.email" type="email" placeholder="ornek@email.com" required />
        </div>
        <div class="form-group">
          <label>Şifre</label>
          <input v-model="registerForm.password" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="registerError" class="error">{{ registerError }}</p>
        <button type="submit" class="submit-btn">Kayıt Ol →</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()
const tab = ref('login')
const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ username: '', email: '', password: '' })
const loginError = ref('')
const registerError = ref('')

async function handleLogin() {
  try {
    const response = await authService.login(loginForm.value)
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('username', response.data.username)
    const payload = JSON.parse(atob(response.data.token.split('.')[1]))
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    localStorage.setItem('role', role)
    router.push('/dashboard')
  } catch {
    loginError.value = 'Email veya şifre hatalı!'
  }
}

async function handleRegister() {
  try {
    const response = await authService.register(registerForm.value)
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('username', response.data.username)
    const payload = JSON.parse(atob(response.data.token.split('.')[1]))
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    localStorage.setItem('role', role)
    router.push('/dashboard')
  } catch {
    registerError.value = 'Kayıt başarısız! Email zaten kullanımda olabilir.'
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
.login-card { background: white; border-radius: 16px; padding: 40px; width: 380px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
.login-header { text-align: center; margin-bottom: 28px; }
.login-logo { font-size: 40px; margin-bottom: 10px; }
.login-header h1 { color: #1e293b; font-size: 22px; font-weight: 700; }
.login-header p { color: #94a3b8; font-size: 13px; margin-top: 4px; }
.tabs { display: flex; background: #f8fafc; border-radius: 8px; padding: 4px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
.tabs button { flex: 1; padding: 8px; border: none; background: none; color: #94a3b8; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; }
.tabs button.active { background: white; color: #6366f1; box-shadow: 0 1px 4px rgba(0,0,0,0.1); font-weight: 600; }
.form-group { margin-bottom: 16px; }
label { display: block; color: #475569; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
input { width: 100%; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b; font-size: 14px; box-sizing: border-box; outline: none; transition: border 0.15s; }
input:focus { border-color: #6366f1; background: white; }
.submit-btn { width: 100%; padding: 11px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; margin-top: 8px; transition: background 0.15s; }
.submit-btn:hover { background: #4f46e5; }
.error { color: #ef4444; font-size: 13px; margin-bottom: 8px; }
</style>