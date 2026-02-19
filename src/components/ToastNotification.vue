<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        <span class="toast-icon">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }}
        </span>
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../stores/toast'
const { toasts } = useToast()
</script>

<style scoped>
.toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
.toast { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 260px; }
.toast.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.toast.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.toast.info { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>