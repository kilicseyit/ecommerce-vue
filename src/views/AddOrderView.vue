<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Yeni Sipariş</h1>
        <p class="subtitle">Ürünleri seç ve siparişi oluştur</p>
      </div>
      <button class="btn-back" @click="router.push('/orders')">← Geri Dön</button>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">

        <!-- Sadece Admin görür -->
        <div v-if="isAdmin" class="form-group" style="margin-bottom: 20px;">
          <label>Müşteri Seç</label>
          <select v-model="selectedUser" required>
            <option :value="null" disabled>Kullanıcı seç</option>
            <option v-for="user in users" :key="user.id" :value="user">
              {{ user.name }} — {{ user.email }}
            </option>
          </select>
        </div>

        <div class="items-section">
          <div class="items-header">
            <h3>Ürünler</h3>
            <button type="button" class="btn-add-item" @click="addItem">+ Ürün Ekle</button>
          </div>

          <div v-for="(item, index) in form.orderItems" :key="index" class="item-row">
            <div class="form-group">
              <label>Ürün</label>
              <select v-model="item.productId" required>
                <option value="" disabled>Ürün seç</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} — {{ product.price }} ₺ (Stok: {{ product.stock }})
                </option>
              </select>
            </div>
            <div class="form-group qty-group">
              <label>Adet</label>
              <input v-model.number="item.quantity" type="number" min="1" required />
            </div>
            <button type="button" class="btn-remove" @click="removeItem(index)">✕</button>
          </div>

          <p v-if="form.orderItems.length === 0" class="empty-items">Henüz ürün eklenmedi.</p>
        </div>

        <div class="form-footer">
          <button type="button" class="btn-cancel" @click="router.push('/orders')">İptal</button>
          <button type="submit" class="btn-primary" :disabled="form.orderItems.length === 0">Siparişi Oluştur</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderService } from '../services/orderService'
import { productService } from '../services/productService'
import { userService } from '../services/userService'
import { authService } from '../services/authService'
import { useToast } from '../stores/toast'

const router = useRouter()
const { show } = useToast()
const isAdmin = computed(() => authService.isAdmin())
const products = ref([])
const users = ref([])
const selectedUser = ref(null)

const form = ref({
  customerName: '',
  customerEmail: '',
  orderItems: []
})

function addItem() {
  form.value.orderItems.push({ productId: '', quantity: 1 })
}

function removeItem(index) {
  form.value.orderItems.splice(index, 1)
}

async function fetchProducts() {
  try {
    const response = await productService.getAll()
    products.value = response.data
  } catch {
    show('Ürünler yüklenemedi!', 'error')
  }
}

async function fetchUsers() {
  if (!isAdmin.value) return
  try {
    const response = await userService.getAll()
    users.value = response.data
  } catch {
    show('Kullanıcılar yüklenemedi!', 'error')
  }
}

async function handleSubmit() {
  try {
    if (isAdmin.value && selectedUser.value) {
      form.value.customerName = selectedUser.value.name
      form.value.customerEmail = selectedUser.value.email
    }
    await orderService.create(form.value)
    show('Sipariş başarıyla oluşturuldu!', 'success')
    setTimeout(() => router.push('/orders'), 1500)
  } catch (err) {
    show(err.response?.data?.message || 'Sipariş oluşturulamadı!', 'error')
  }
}

onMounted(() => {
  fetchProducts()
  fetchUsers()
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.card { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); padding: 28px; }
.items-section { border: 1px solid var(--border); border-radius: 10px; padding: 20px; margin-bottom: 24px; }
.items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.items-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.btn-add-item { padding: 8px 16px; background: #eef2ff; color: #6366f1; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
.item-row { display: grid; grid-template-columns: 1fr 120px auto; gap: 12px; align-items: end; margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
input, select { padding: 10px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; transition: border 0.15s; }
input:focus, select:focus { border-color: #6366f1; }
.btn-remove { padding: 10px; background: #fef2f2; color: #ef4444; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; align-self: end; }
.empty-items { text-align: center; color: var(--text-secondary); padding: 24px; font-size: 14px; }
.form-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 24px; border-top: 1px solid var(--border); }
.btn-primary { padding: 10px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { padding: 10px 24px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-back { padding: 8px 16px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; }
</style>