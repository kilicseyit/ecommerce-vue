<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Kullanıcı Yönetimi</h1>
        <p class="subtitle">Toplam {{ users.length }} kullanıcı</p>
      </div>
    </div>

    <div class="card">
      <p v-if="loading" class="loading">Yükleniyor...</p>

      <table v-if="users.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı Adı</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Kayıt Tarihi</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="id-col">#{{ user.id }}</td>
            <td class="name-col">{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <select :value="user.role" @change="handleRoleChange(user.id, $event.target.value)" class="role-select" :class="user.role === 'Admin' ? 'role-admin' : 'role-user'">
                <option value="User">👤 User</option>
                <option value="Admin">👑 Admin</option>
              </select>
            </td>
            <td>{{ new Date(user.createdAt).toLocaleDateString('tr-TR') }}</td>
            <td>
              <button class="btn-delete" @click="openDeleteModal(user.id, user.username)">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else-if="!loading" class="empty">Henüz kullanıcı yok.</p>
    </div>

    <!-- Silme Modalı -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Kullanıcıyı Sil</h3>
          <button class="modal-close" @click="closeDeleteModal">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>{{ deleteUsername }}</strong> kullanıcısını silmek istediğine emin misin?</p>
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
import { ref, onMounted } from 'vue'
import { userService } from '../services/userService'
import { useToast } from '../stores/toast'

const { show } = useToast()
const users = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const deleteUserId = ref(null)
const deleteUsername = ref('')

async function fetchUsers() {
  try {
    const response = await userService.getAll()
    users.value = response.data
  } catch {
    show('Kullanıcılar yüklenemedi!', 'error')
  } finally {
    loading.value = false
  }
}

async function handleRoleChange(id, role) {
  try {
    await userService.updateRole(id, role)
    const user = users.value.find(u => u.id === id)
    if (user) user.role = role
    show('Rol güncellendi!', 'success')
  } catch {
    show('Rol güncellenemedi!', 'error')
  }
}

function openDeleteModal(id, username) {
  deleteUserId.value = id
  deleteUsername.value = username
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteUserId.value = null
  deleteUsername.value = ''
}

async function confirmDelete() {
  try {
    await userService.delete(deleteUserId.value)
    users.value = users.value.filter(u => u.id !== deleteUserId.value)
    show('Kullanıcı silindi!', 'success')
    closeDeleteModal()
  } catch {
    show('Kullanıcı silinemedi!', 'error')
  }
}

onMounted(fetchUsers)
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
.role-select { padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); font-size: 13px; cursor: pointer; }
.role-admin { background: #eef2ff; color: #6366f1; }
.role-user { background: var(--bg); color: var(--text-primary); }
.btn-delete { padding: 6px 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
.loading, .empty { text-align: center; color: var(--text-secondary); padding: 48px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--card-bg); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); min-width: 400px; overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; }
.modal-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
.modal-body { padding: 20px 24px; }
.modal-body p { color: var(--text-primary); font-size: 14px; margin: 0 0 8px 0; }
.modal-warning { background: rgba(220, 38, 38, 0.15); color: #f87171; padding: 10px 12px; border-radius: 8px; border-left: 3px solid #f87171; font-size: 13px; font-weight: 500; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
.btn-cancel { padding: 9px 18px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-delete-confirm { padding: 9px 18px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
</style>