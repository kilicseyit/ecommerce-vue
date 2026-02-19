<template>
  <div class="container">
    <h2>Profilim</h2>

    <div v-if="loading">Yükleniyor...</div>

    <div v-else class="profile-box">
      <div class="info-section">
        <h3>Hesap Bilgileri</h3>
        <div class="info-row">
          <span class="label">Email:</span>
          <span>{{ profile.email }}</span>
        </div>
        <div class="info-row">
          <span class="label">Rol:</span>
          <span class="role-badge">{{ profile.role }}</span>
        </div>
        <div class="info-row">
          <span class="label">Kayıt Tarihi:</span>
          <span>{{ new Date(profile.createdAt).toLocaleDateString('tr-TR') }}</span>
        </div>
      </div>

      <div class="edit-section">
        <h3>Bilgileri Güncelle</h3>
        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label>Kullanıcı Adı</label>
            <input v-model="form.username" type="text" required />
          </div>
          <div class="form-group">
            <label>Mevcut Şifre</label>
            <input v-model="form.currentPassword" type="password" placeholder="Şifre değiştirmek için girin" />
          </div>
          <div class="form-group">
            <label>Yeni Şifre</label>
            <input v-model="form.newPassword" type="password" placeholder="Yeni şifre" />
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>
          <button type="submit">Güncelle</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authService } from '../services/authService'

const profile = ref({})
const loading = ref(true)
const error = ref('')
const success = ref('')

const form = ref({
  username: '',
  currentPassword: '',
  newPassword: ''
})

async function fetchProfile() {
  try {
    const response = await authService.getProfile()
    profile.value = response.data
    form.value.username = response.data.username
  } catch {
    error.value = 'Profil yüklenemedi!'
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  try {
    error.value = ''
    success.value = ''
    const response = await authService.updateProfile(form.value)
    profile.value = response.data
    localStorage.setItem('username', response.data.username)
    form.value.currentPassword = ''
    form.value.newPassword = ''
    success.value = 'Profil başarıyla güncellendi!'
  } catch {
    error.value = 'Güncelleme başarısız! Mevcut şifreyi kontrol et.'
  }
}

onMounted(fetchProfile)
</script>

<style scoped>
.container { max-width: 700px; margin: 40px auto; padding: 0 20px; }
h2 { margin-bottom: 24px; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.profile-box { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.info-section, .edit-section { background: var(--card-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--border); }
h3 { margin-bottom: 16px; color: var(--text-primary); font-size: 15px; font-weight: 600; }
.info-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.label { font-weight: 600; color: var(--text-secondary); min-width: 100px; font-size: 13px; }
.info-row span { color: var(--text-primary); font-size: 14px; }
.role-badge { padding: 4px 10px; background: #eef2ff; color: #6366f1; border-radius: 12px; font-size: 13px; font-weight: 500; }
.form-group { margin-bottom: 16px; }
label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--text-secondary); }
input { width: 100%; padding: 10px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; box-sizing: border-box; outline: none; transition: border 0.15s; }
input:focus { border-color: #6366f1; }
button { width: 100%; padding: 10px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.15s; }
button:hover { background: #4f46e5; }
.error { color: #ef4444; margin-bottom: 10px; font-size: 13px; }
.success { color: #22c55e; margin-bottom: 10px; font-size: 13px; }
</style>