<template>
  <div class="messages-layout">
    <!-- Sol: Konuşmalar -->
    <div class="conversations-panel">
      <div class="panel-header">
        <h2>💬 Mesajlar</h2>
      </div>
      <p v-if="loadingConversations" class="loading">Yükleniyor...</p>
      <div v-else-if="conversations.length === 0" class="empty">Henüz konuşma yok.</div>
      <div v-for="conv in conversations" :key="conv.userId"
           :class="['conversation-item', { active: selectedUserId === conv.userId }]"
           @click="selectConversation(conv)">
        <div class="conv-avatar">{{ conv.username.charAt(0).toUpperCase() }}</div>
        <div class="conv-info">
          <div class="conv-top">
            <span class="conv-name">{{ conv.username }}</span>
            <span class="conv-time">{{ formatDate(conv.lastMessageAt) }}</span>
            <button class="btn-delete-conv" @click.stop="deleteConversation(conv.userId)">✕</button>
          </div>
          <div class="conv-bottom">
            <span class="conv-last">{{ conv.lastMessage }}</span>
            <span v-if="conv.unreadCount > 0" class="unread-badge">{{ conv.unreadCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sağ: Mesajlaşma -->
    <div class="chat-panel">
      <div v-if="!selectedUserId" class="no-chat">
        <p>💬 Bir konuşma seçin</p>
      </div>

      <div v-else style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
        <div class="chat-header">
          <div class="chat-avatar">{{ selectedUsername.charAt(0).toUpperCase() }}</div>
          <span class="chat-username">{{ selectedUsername }}</span>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <p v-if="loadingMessages" class="loading">Yükleniyor...</p>
          <div v-for="msg in messages" :key="msg.id"
               :class="['message', msg.isMine ? 'mine' : 'theirs']">
            <div class="message-bubble">{{ msg.content }}</div>
            <div class="message-time">{{ formatDate(msg.createdAt) }}</div>
          </div>
        </div>

        <div class="chat-input">
          <input v-model="newMessage" type="text" placeholder="Mesaj yaz..."
                 @keyup.enter="sendMessage" />
          <button class="btn-send" @click="sendMessage" :disabled="!newMessage.trim()">Gönder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { useToast } from '../stores/toast'
import { clearUnreadMessageCount, unreadMessageCount } from '../stores/messages'

const route = useRoute()

const { show } = useToast()
const conversations = ref([])
const messages = ref([])
const selectedUserId = ref(null)
const selectedUsername = ref('')
const newMessage = ref('')
const loadingConversations = ref(true)
const loadingMessages = ref(false)
const messagesContainer = ref(null)

async function fetchConversations() {
  try {
    const res = await api.get('/messages/conversations')
    conversations.value = res.data
  } catch {
    show('Konuşmalar yüklenemedi!', 'error')
  } finally {
    loadingConversations.value = false
  }
}
async function deleteConversation(otherUserId) {
  try {
    await api.delete(`/messages/${otherUserId}`)
    conversations.value = conversations.value.filter(c => c.userId !== otherUserId)
    if (selectedUserId.value === otherUserId) {
      selectedUserId.value = null
      messages.value = []
    }
    show('Sohbet silindi!', 'success')
  } catch {
    show('Sohbet silinemedi!', 'error')
  }
}

async function selectConversation(conv) {
  selectedUserId.value = conv.userId
  selectedUsername.value = conv.username
  loadingMessages.value = true
  try {
    const res = await api.get(`/messages/${conv.userId}`)
    messages.value = res.data
    await nextTick()
    scrollToBottom()
    // Okunmamış sayısını sıfırla
    conv.unreadCount = 0
  } catch {
    show('Mesajlar yüklenemedi!', 'error')
  } finally {
    loadingMessages.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim()) return
  try {
    const res = await api.post(`/messages/${selectedUserId.value}`, { content: newMessage.value })
    messages.value.push({
      id: res.data.id,
      content: newMessage.value,
      createdAt: res.data.createdAt,
      isMine: true
    })
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
    await fetchConversations()
  } catch {
    show('Mesaj gönderilemedi!', 'error')
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatDate(date) {
  // UTC string'e Z ekle eğer yoksa
  const utcDate = typeof date === 'string' && !date.endsWith('Z') ? date + 'Z' : date
  const d = new Date(utcDate)
  return d.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Istanbul'
  })
}

onMounted(async () => {
  clearUnreadMessageCount()
  await fetchConversations()

  if (route.query.userId) {
    const userId = parseInt(route.query.userId)
    const username = route.query.username
    await selectConversation({ userId, username })
  }
})
</script>

<style scoped>
.conv-actions { display: flex; align-items: center; gap: 6px; }
.btn-delete-conv { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 12px; padding: 2px 4px; border-radius: 4px; opacity: 0; transition: all 0.15s; }
.conversation-item:hover .btn-delete-conv { opacity: 1; }
.btn-delete-conv:hover { background: #fef2f2; color: #ef4444; }
.messages-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 64px);
  gap: 0;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.conversations-panel { border-right: 1px solid var(--border); display: flex; flex-direction: column; }
.panel-header { padding: 20px; border-bottom: 1px solid var(--border); }
.panel-header h2 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
.conversation-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.15s; }
.conversation-item:hover { background: var(--hover); }
.conversation-item.active { background: rgba(99,102,241,0.08); border-left: 3px solid #6366f1; }
.conv-avatar { width: 40px; height: 40px; border-radius: 50%; background: #eef2ff; color: #6366f1; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.conv-info { flex: 1; min-width: 0; }
.conv-top { display: flex; justify-content: space-between; align-items: center; }
.conv-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.conv-time { font-size: 11px; color: var(--text-secondary); }
.conv-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 2px; }
.conv-last { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.unread-badge { background: #6366f1; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 20px; }
.chat-panel { 
  display: flex; 
  flex-direction: column; 
  height: 100%;
  overflow: hidden;  /* Bunu ekle */
}
.no-chat { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); font-size: 16px; }
.chat-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: #eef2ff; color: #6366f1; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.chat-username { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chat-messages { 
  flex: 1; 
  overflow-y: auto;   /* Bu scroll yapacak, büyümeyecek */
  min-height: 0;      /* Bu kritik! flex item'ın shrink olmasına izin verir */
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}
.message { display: flex; flex-direction: column; max-width: 60%; }
.message.mine { align-self: flex-end; align-items: flex-end; }
.message.theirs { align-self: flex-start; align-items: flex-start; }
.message-bubble { padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
.mine .message-bubble { background: #6366f1; color: white; border-bottom-right-radius: 4px; }
.theirs .message-bubble { background: var(--bg); color: var(--text-primary); border-bottom-left-radius: 4px; }
.message-time { font-size: 10px; color: var(--text-secondary); margin-top: 4px; }
.chat-input { 
  padding: 16px 20px; 
  border-top: 1px solid var(--border); 
  display: flex; 
  gap: 10px;
  flex-shrink: 0;  /* Bu da kritik! input alanı küçülmesin */
}
.chat-input input { flex: 1; padding: 10px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; }
.btn-send { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
.btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
.loading, .empty { text-align: center; padding: 24px; color: var(--text-secondary); font-size: 13px; }
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
</style>