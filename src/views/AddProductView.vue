<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Yeni Ürün Ekle</h1>
        <p class="subtitle">Ürün bilgilerini doldur</p>
      </div>
      <button class="btn-back" @click="router.push('/products')">← Geri Dön</button>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>Ürün Adı</label>
            <input v-model="form.name" type="text" placeholder="Ürün adı" required />
          </div>
          <div class="form-group">
            <label>Kategori</label>
            <select v-model="form.categoryId" required>
              <option value="" disabled>Kategori seç</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group full-width">
            <label>Açıklama</label>
            <input v-model="form.description" type="text" placeholder="Açıklama" required />
          </div>
          <div class="form-group">
            <label>Fiyat (₺)</label>
            <input v-model="form.price" type="number" placeholder="0" required />
          </div>
          <div class="form-group">
            <label>İndirimli Fiyat (₺) <span class="optional">opsiyonel</span></label>
            <input v-model="form.discountPrice" type="number" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Stok</label>
            <input v-model="form.stock" type="number" placeholder="0" required />
          </div>
        </div>

        <!-- Görsel Yükleme -->
        <div class="image-section">
          <label>Ürün Görseli <span class="optional">opsiyonel</span></label>
          <div class="image-upload" @click="triggerFileInput" :class="{ 'has-image': previewUrl }">
            <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
            <div v-else class="upload-placeholder">
              <span class="upload-icon">🖼️</span>
              <span>Görsel yüklemek için tıkla</span>
            </div>
          </div>
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" style="display:none" />
        </div>

        <div class="form-footer">
          <button type="button" class="btn-cancel" @click="router.push('/products')">İptal</button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Ekleniyor...' : 'Ürünü Ekle' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { useToast } from '../stores/toast'

const router = useRouter()
const { show } = useToast()
const categories = ref([])
const loading = ref(false)
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)

const form = ref({
  name: '',
  description: '',
  price: 0,
  discountPrice: null,
  stock: 0,
  categoryId: ''
})

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function fetchCategories() {
  try {
    const response = await categoryService.getAll()
    categories.value = response.data
  } catch {
    show('Kategoriler yüklenemedi!', 'error')
  }
}

async function handleSubmit() {
  loading.value = true
  try {
    const response = await productService.create({
      ...form.value,
      discountPrice: form.value.discountPrice || null
    })

    // Görsel varsa yükle
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      await productService.uploadImage(response.data.id, formData)
    }

    show('Ürün başarıyla eklendi!', 'success')
    setTimeout(() => router.push('/products'), 1500)
  } catch {
    show('Ürün eklenemedi!', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.card { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); padding: 28px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.optional { font-size: 11px; color: var(--text-secondary); font-weight: 400; margin-left: 4px; }
input, select { padding: 10px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; transition: border 0.15s; }
input:focus, select:focus { border-color: #6366f1; }
select option { background: var(--card-bg); color: var(--text-primary); }
.image-section { margin-top: 24px; display: flex; flex-direction: column; gap: 8px; }
.image-upload { border: 2px dashed var(--border); border-radius: 10px; padding: 32px; cursor: pointer; text-align: center; transition: border 0.15s; }
.image-upload:hover { border-color: #6366f1; }
.image-upload.has-image { padding: 0; border-style: solid; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 14px; }
.upload-icon { font-size: 32px; }
.preview-img { width: 100%; max-height: 250px; object-fit: contain; border-radius: 8px; }
.form-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
.btn-primary { padding: 10px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background 0.15s; }
.btn-primary:hover { background: #4f46e5; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { padding: 10px 24px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-back { padding: 8px 16px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; }
</style>