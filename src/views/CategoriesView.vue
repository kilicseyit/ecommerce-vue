<template>
  <div class="container">
    <div class="page-header">
      <div>
        <h1>Kategoriler</h1>
        <p class="subtitle">Toplam {{ categories.length }} kategori</p>
      </div>
    </div>

    <div v-if="isAdmin" class="form-card">
      <h3>Yeni Kategori Ekle</h3>
      <div class="form-row">
        <input v-model="form.name" type="text" placeholder="Kategori adı" />
        <input v-model="form.description" type="text" placeholder="Açıklama" />
        <button class="btn-add" @click="handleCreate">Ekle</button>
      </div>
      <p v-if="formError" class="error">{{ formError }}</p>
    </div>

    <div class="card">
      <p v-if="loading" class="loading">Yükleniyor...</p>

      <table v-if="categories.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kategori Adı</th>
            <th>Açıklama</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>#{{ category.id }}</td>
            <td style="color: var(--text-primary); font-weight: 500;">{{ category.name }}</td>
            <td>{{ category.description }}</td>
            <td>
              <button v-if="isAdmin" class="btn-delete" @click="handleDelete(category.id)">Sil</button>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else-if="!loading" class="empty">Henüz kategori yok.</p>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryService } from '../services/categoryService'
import { authService } from '../services/authService'

const router = useRouter()
const isAdmin = computed(() => authService.isAdmin())
const categories = ref([])
const loading = ref(true)
const error = ref('')
const formError = ref('')

const form = ref({
  name: '',
  description: ''
})

async function fetchCategories() {
  try {
    const response = await categoryService.getAll()
    categories.value = response.data
  } catch {
    error.value = 'Kategoriler yüklenemedi!'
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!form.value.name) {
    formError.value = 'Kategori adı zorunlu!'
    return
  }
  try {
    await categoryService.create({ ...form.value, isActive: true })
    form.value = { name: '', description: '' }
    formError.value = ''
    await fetchCategories()
  } catch {
    formError.value = 'Kategori eklenemedi!'
  }
}

async function handleDelete(id) {
  try {
    await categoryService.delete(id)
    categories.value = categories.value.filter(c => c.id !== id)
  } catch {
    error.value = 'Kategori silinemedi!'
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.container { max-width: 800px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.form-card { background: var(--card-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 24px; }
.form-card h3 { margin-bottom: 16px; font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.form-row { display: flex; gap: 10px; }
.form-row input { flex: 1; padding: 10px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; transition: border 0.15s; }
.form-row input:focus { border-color: #6366f1; }
.btn-add { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; white-space: nowrap; transition: background 0.15s; }
.btn-add:hover { background: #4f46e5; }
.card { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; color: var(--text-secondary); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: var(--bg); border-bottom: 1px solid var(--border); }
td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text-secondary); }
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--hover); }
.btn-delete { padding: 6px 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.btn-delete:hover { background: #ef4444; color: white; }
.error { color: #ef4444; margin-top: 8px; font-size: 13px; }
.loading, .empty { text-align: center; color: var(--text-secondary); padding: 48px; }
</style>