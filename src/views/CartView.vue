<template>
  <div>
    <div class="page-header">
      <h1>🛒 Sepetim</h1>
    </div>

    <div v-if="items.length === 0" class="empty-cart">
      <p>🛒 Sepetiniz boş</p>
      <button class="btn-primary" @click="router.push('/marketplace')">Alışverişe Başla</button>
    </div>

    <div v-else class="cart-layout">
      <div class="cart-items">
  <div class="items-header">
    <button v-if="items.length > 0" class="btn-clear-top" @click="clearCart">🗑️ Tümünü Kaldır</button>
  </div>
  <div v-for="item in items" :key="item.productId" class="cart-item">
    <img v-if="item.imageUrl" :src="`${baseURL}${item.imageUrl}`" class="item-image" />
    <div v-else class="item-no-image">🖼️</div>
    <div class="item-info">
      <h3>{{ item.name }}</h3>
      <p class="item-price">{{ item.price }} ₺</p>
    </div>
    <div class="item-quantity">
      <button @click="updateQuantity(item.productId, item.quantity - 1)">−</button>
      <span>{{ item.quantity }}</span>
      <button @click="updateQuantity(item.productId, item.quantity + 1)">+</button>
    </div>
    <p class="item-total">{{ (item.price * item.quantity).toFixed(2) }} ₺</p>
    <button class="btn-remove" @click="removeFromCart(item.productId)">✕</button>
  </div>
</div>

      <div class="cart-summary">
        <h3>Sipariş Özeti</h3>
        <div class="summary-row">
          <span>Toplam</span>
          <span>{{ totalPrice.toFixed(2) }} ₺</span>
        </div>
        <button class="btn-primary btn-order" @click="placeOrder" :disabled="ordering">
          {{ ordering ? 'Sipariş veriliyor...' : 'Siparişi Tamamla' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../stores/cart'
import { useToast } from '../stores/toast'
import api from '../services/api'
import { baseURL } from '../services/api'

const router = useRouter()
const { items, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart()
const { show } = useToast()
const ordering = ref(false)

async function placeOrder() {
  ordering.value = true
  try {
    await api.post('/orders', {
      orderItems: items.value.map(i => ({
        productId: i.productId,
        quantity: i.quantity
      }))
    })
    clearCart()
    show('Siparişiniz alındı!', 'success')
    router.push('/orders')
  } catch (e) {
    show(e.response?.data || 'Sipariş verilemedi!', 'error')
  } finally {
    ordering.value = false
  }
}
</script>

<style scoped>
.items-header { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.btn-clear-top { padding: 4px 10px; background: #fef2f2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; }
.btn-clear-top:hover { background: #ef4444; color: white; transition: all 0.15s; }
.btn-clear { padding: 8px 16px; background: #fef2f2; color: #ef4444; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }
.btn-clear:hover { background: #ef4444; color: white; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.empty-cart { text-align: center; padding: 80px; color: var(--text-secondary); }
.empty-cart p { font-size: 20px; margin-bottom: 20px; }
.cart-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
.cart-items { display: flex; flex-direction: column; gap: 12px; }
.cart-item { display: flex; align-items: center; gap: 16px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
.item-image { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; }
.item-no-image { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: var(--bg); border-radius: 8px; font-size: 24px; }
.item-info { flex: 1; }
.item-info h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.item-price { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.item-quantity { display: flex; align-items: center; gap: 12px; }
.item-quantity button { width: 28px; height: 28px; border: 1px solid var(--border); background: var(--bg); border-radius: 6px; cursor: pointer; color: var(--text-primary); font-size: 16px; }
.item-quantity span { font-size: 14px; font-weight: 600; color: var(--text-primary); min-width: 20px; text-align: center; }
.item-total { font-size: 14px; font-weight: 700; color: var(--text-primary); min-width: 80px; text-align: right; }
.btn-remove { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px; padding: 4px; }
.cart-summary { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.cart-summary h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
.summary-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 20px; }
.btn-primary { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
.btn-order { width: 100%; padding: 14px; font-size: 15px; }
.btn-order:disabled { opacity: 0.6; cursor: not-allowed; }
</style>