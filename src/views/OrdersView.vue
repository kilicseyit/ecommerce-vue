<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Siparişler</h1>
        <p class="subtitle">Toplam {{ orders.length }} sipariş</p>
      </div>
      <button v-if="isAdmin" class="btn-primary" @click="router.push('/orders/add')">+ Yeni Sipariş</button>
    </div>

    <div class="card">
      <p v-if="loading" class="loading">Yükleniyor...</p>

      <table v-if="orders.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Müşteri</th>
            <th>Email</th>
            <th>Toplam</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th v-if="isAdmin">İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td class="id-col">#{{ order.id }}</td>
            <td class="name-col">{{ order.customerName }}</td>
            <td>{{ order.customerEmail }}</td>
            <td><span class="price-badge">{{ order.totalPrice }} ₺</span></td>
            <td>
              <select v-if="isAdmin" :value="order.status" @change="handleStatusChange(order.id, $event.target.value)" class="status-select" :class="getStatusClass(order.status)">
                <option value="Pending">⏳ Bekliyor</option>
                <option value="Processing">⚙️ İşleniyor</option>
                <option value="Shipped">🚚 Kargoda</option>
                <option value="Delivered">✅ Teslim Edildi</option>
                <option value="Cancelled">❌ İptal</option>
              </select>
              <span v-else :class="['status-badge', getStatusClass(order.status)]">{{ getStatusLabel(order.status) }}</span>
            </td>
            <td>{{ new Date(order.createdAt).toLocaleDateString('tr-TR') }}</td>
            <td v-if="isAdmin">
              <button class="btn-detail" @click="openDetail(order)">Detay</button>
              <button class="btn-delete" @click="openDeleteModal(order.id)">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else-if="!loading" class="empty">Henüz sipariş yok.</p>
    </div>

    <!-- Detay Modalı -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Sipariş #{{ selectedOrder?.id }} Detayı</h3>
          <button class="modal-close" @click="showDetailModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-info">
            <p><strong>Müşteri:</strong> {{ selectedOrder?.customerName }}</p>
            <p><strong>Email:</strong> {{ selectedOrder?.customerEmail }}</p>
            <p><strong>Durum:</strong> {{ getStatusLabel(selectedOrder?.status) }}</p>
            <p><strong>Toplam:</strong> {{ selectedOrder?.totalPrice }} ₺</p>
          </div>
          <h4>Ürünler</h4>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Birim Fiyat</th>
                <th>Toplam</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedOrder?.orderItems" :key="item.id">
                <td>{{ item.productName }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.unitPrice }} ₺</td>
                <td>{{ item.totalPrice }} ₺</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Silme Modalı -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Siparişi Sil</h3>
          <button class="modal-close" @click="closeDeleteModal">✕</button>
        </div>
        <div class="modal-body">
          <p>Bu siparişi silmek istediğine emin misin?</p>
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
import { orderService } from '../services/orderService'
import { authService } from '../services/authService'
import { useToast } from '../stores/toast'

const router = useRouter()
const { show } = useToast()
const isAdmin = computed(() => authService.isAdmin())
const orders = ref([])
const loading = ref(true)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const selectedOrder = ref(null)
const deleteOrderId = ref(null)

async function fetchOrders() {
  try {
    const response = isAdmin.value 
      ? await orderService.getAll()
      : await orderService.getMyOrders()
    orders.value = response.data
  } catch {
    show('Siparişler yüklenemedi!', 'error')
  } finally {
    loading.value = false
  }
}

async function handleStatusChange(id, status) {
  try {
    await orderService.updateStatus(id, status)
    const order = orders.value.find(o => o.id === id)
    if (order) order.status = status
    show('Sipariş durumu güncellendi!', 'success')
  } catch {
    show('Durum güncellenemedi!', 'error')
  }
}

function openDetail(order) {
  selectedOrder.value = order
  showDetailModal.value = true
}

function openDeleteModal(id) {
  deleteOrderId.value = id
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteOrderId.value = null
}

async function confirmDelete() {
  try {
    await orderService.delete(deleteOrderId.value)
    orders.value = orders.value.filter(o => o.id !== deleteOrderId.value)
    show('Sipariş silindi!', 'success')
    closeDeleteModal()
  } catch {
    show('Sipariş silinemedi!', 'error')
  }
}

function getStatusClass(status) {
  const map = {
    Pending: 'status-pending',
    Processing: 'status-processing',
    Shipped: 'status-shipped',
    Delivered: 'status-delivered',
    Cancelled: 'status-cancelled'
  }
  return map[status] || ''
}

function getStatusLabel(status) {
  const map = {
    Pending: '⏳ Bekliyor',
    Processing: '⚙️ İşleniyor',
    Shipped: '🚚 Kargoda',
    Delivered: '✅ Teslim Edildi',
    Cancelled: '❌ İptal'
  }
  return map[status] || status
}

onMounted(fetchOrders)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.subtitle { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.card { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; color: var(--text-secondary); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: var(--bg); border-bottom: 1px solid var(--border); }
td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text-secondary); }
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--hover); }
.id-col { color: var(--text-secondary); }
.name-col { color: var(--text-primary); font-weight: 500; }
.price-badge { background: #eef2ff; color: #6366f1; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; }
.btn-primary { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
.btn-detail { padding: 6px 14px; background: #eef2ff; color: #6366f1; border: none; border-radius: 6px; cursor: pointer; margin-right: 6px; font-size: 13px; font-weight: 500; }
.btn-delete { padding: 6px 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }

.status-select { padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--text-primary); font-size: 13px; cursor: pointer; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.status-pending { background: #fef9c3; color: #854d0e; }
.status-processing { background: #eff6ff; color: #1d4ed8; }
.status-shipped { background: #f0fdf4; color: #166534; }
.status-delivered { background: #f0fdf4; color: #15803d; }
.status-cancelled { background: #fef2f2; color: #dc2626; }

.loading, .empty { text-align: center; color: var(--text-secondary); padding: 48px; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--card-bg); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); min-width: 480px; overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; }
.modal-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
.modal-body { padding: 20px 24px; }
.modal-body p { color: var(--text-primary); font-size: 14px; margin: 0 0 8px 0; }
.modal-warning { background: rgba(220, 38, 38, 0.15); color: #f87171; padding: 10px 12px; border-radius: 8px; border-left: 3px solid #f87171; font-size: 13px; font-weight: 500; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
.btn-cancel { padding: 9px 18px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-delete-confirm { padding: 9px 18px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
.detail-info { background: var(--bg); border-radius: 8px; padding: 16px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.detail-info p { margin: 0; font-size: 14px; color: var(--text-primary); }
.detail-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.detail-table th { text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 12px; background: var(--bg); border-bottom: 1px solid var(--border); }
.detail-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-primary); }
h4 { color: var(--text-primary); font-size: 14px; margin: 0 0 8px 0; }
</style>