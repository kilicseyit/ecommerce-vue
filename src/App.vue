<template>
  <div class="app-layout" :class="{ 'with-sidebar': isLoggedIn }">
    <Sidebar v-if="isLoggedIn" />
    <main class="main-content">
      <RouterView />
    </main>
    <ToastNotification />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import ToastNotification from './components/ToastNotification.vue'

const route = useRoute()
const isLoggedIn = computed(() => route.path !== '/login')
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', Arial, sans-serif; }

:root, [data-theme="light"] {
  --bg: #f8fafc;
  --sidebar-bg: white;
  --card-bg: white;
  --border: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #94a3b8;
  --hover: #f8fafc;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --sidebar-bg: #1e293b;
  --card-bg: #1e293b;
  --border: #334155;
  --text-primary: #e2e8f0;
  --text-secondary: #64748b;
  --hover: #0f172a;
}
[data-theme="dark"] .modal-warning {
  background: #3b1f1f;
  color: #f87171;
  border-left-color: #f87171;
}

body { background: var(--bg); color: var(--text-primary); transition: background 0.2s, color 0.2s; }
.app-layout { display: flex; min-height: 100vh; }
.main-content { flex: 1; margin-left: 240px; padding: 32px; }
.app-layout:not(.with-sidebar) .main-content { margin-left: 0; padding: 0; }
</style>