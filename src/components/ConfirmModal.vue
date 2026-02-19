<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="show" @click.self="$emit('cancel')">
      <div class="modal">
        <div class="modal-icon">🗑️</div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="$emit('cancel')">İptal</button>
          <button class="btn-confirm" @click="$emit('confirm')">Evet, Sil</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: 'Emin misin?' },
  message: { type: String, default: 'Bu işlem geri alınamaz.' }
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  width: 360px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: pop 0.2s ease;
}

@keyframes pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-icon { font-size: 40px; margin-bottom: 16px; }
h3 { color: var(--text-primary); font-size: 18px; margin-bottom: 8px; }
p { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }

.modal-actions { display: flex; gap: 10px; }

.btn-cancel {
  flex: 1;
  padding: 10px;
  background: var(--hover);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
}

.btn-cancel:hover { background: var(--border); }

.btn-confirm {
  flex: 1;
  padding: 10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-confirm:hover { background: #dc2626; }
</style>