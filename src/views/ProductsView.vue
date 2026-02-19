<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Ürünler</h1>
        <p class="subtitle">Toplam {{ filteredProducts.length }} ürün listeleniyor</p>
      </div>
      <button v-if="isAdmin" class="btn-primary" @click="router.push('/products/add')">+ Yeni Ürün</button>
    </div>

    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" type="text" placeholder="Ürün adı veya kategoriye göre ara..." />
    </div>

    <div class="card">
      <p v-if="loading" class="loading">Yükleniyor...</p>

      <table v-if="filteredProducts.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ürün Adı</th>
            <th>Açıklama</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Kategori</th>
            <th v-if="isAdmin">İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td class="id-col">#{{ product.id }}</td>
            <td class="name-col">{{ product.name }}</td>
            <td class="desc-col">{{ product.description }}</td>
            <td><span class="price-badge">{{ product.price }} ₺</span></td>
            <td><span :class="product.stock > 0 ? 'stock-ok' : 'stock-empty'">{{ product.stock }}</span></td>
            <td><span class="category-badge">{{ product.categoryName }}</span></td>
            <td v-if="isAdmin">
              <button class="btn-edit" @click="router.push(`/products/edit/${product.id}`)">Düzenle</button>
              <button class="btn-delete" @click="openDeleteModal(product.id, product.name)">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else-if="!loading" class="empty">
        {{ searchQuery ? 'Arama sonucu bulunamadı.' : 'Henüz ürün yok.' }}
      </p>
    </div>

    <!-- Silme Modalı -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Ürünü Sil</h3>
          <button class="modal-close" @click="closeDeleteModal">✕</button>
        </div>
        <div class="modal-body">
          <p>Gerçekten <strong>{{ deleteProductName }}</strong> ürününü silmek istediğine emin misin?</p>
          <p class="modal-warning">⚠️ Bu işlem geri alınamaz!</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeleteModal">İptal</button>
          <button class="btn-delete-confirm" @click="confirmDelete">Sil</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '../services/productService'
import { authService } from '../services/authService'
import { useToast } from '../stores/toast'

const router = useRouter()
const { show } = useToast()
const isAdmin = computed(() => authService.isAdmin())
const products = ref([])
const loading = ref(true)
const searchQuery = ref('')
const showDeleteModal = ref(false)
const deleteProductId = ref(null)
const deleteProductName = ref('')

const filteredProducts = computed(() => {
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

async function fetchProducts() {
  try {
    const response = await productService.getAll()
    products.value = response.data
  } catch {
    show('Ürünler yüklenemedi!', 'error')
  } finally {
    loading.value = false
  }
}

function openDeleteModal(id, name) {
  deleteProductId.value = id
  deleteProductName.value = name
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteProductId.value = null
  deleteProductName.value = ''
}

async function confirmDelete() {
  try {
    await productService.delete(deleteProductId.value)
    products.value = products.value.filter(p => p.id !== deleteProductId.value)
    show('Ürün başarıyla silindi!', 'success')
    closeDeleteModal()
  } catch {
    show('Ürün silinemedi!', 'error')
  }
}

onMounted(fetchProducts)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }

.search-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 12px 16px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; }
.search-icon { font-size: 18px; }
.search-bar input { flex: 1; background: none; border: none; color: var(--text-primary); font-size: 14px; outline: none; }
.search-bar input::placeholder { color: var(--text-secondary); }

.card { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; color: var(--text-secondary); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: var(--bg); border-bottom: 1px solid var(--border); }
td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text-secondary); }
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--hover); }
.id-col { color: var(--text-secondary); font-size: 13px; }
.name-col { color: var(--text-primary); font-weight: 500; }
.price-badge { background: #eef2ff; color: #6366f1; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; }
.stock-ok { color: #22c55e; font-weight: 600; }
.stock-empty { color: #ef4444; font-weight: 600; }
.category-badge { background: #f0fdf4; color: #16a34a; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.btn-primary { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background 0.15s; }
.btn-primary:hover { background: #4f46e5; }
.btn-edit { padding: 6px 14px; background: #eef2ff; color: #6366f1; border: none; border-radius: 6px; cursor: pointer; margin-right: 6px; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.btn-edit:hover { background: #6366f1; color: white; }
.btn-delete { padding: 6px 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.btn-delete:hover { background: #ef4444; color: white; }
.loading, .empty { text-align: center; color: var(--text-secondary); padding: 48px; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--card-bg); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); min-width: 380px; overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; }
.modal-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
.modal-body { padding: 20px 24px; }
.modal-body p { color: var(--text-primary); font-size: 14px; line-height: 1.5; margin: 0 0 12px 0; }
.modal-warning { background: rgba(220, 38, 38, 0.15); color: #f87171; padding: 10px 12px; border-radius: 8px; border-left: 3px solid #f87171; font-size: 13px; font-weight: 500; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
.btn-cancel { padding: 9px 18px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-delete-confirm { padding: 9px 18px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
.btn-delete-confirm:hover { background: #dc2626; }
</style>