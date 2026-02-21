import { ref, computed, watch } from 'vue'

const saved = localStorage.getItem('cart')
const items = ref(saved ? JSON.parse(saved) : [])

// items değişince localStorage'a kaydet
watch(items, (val) => {
  localStorage.setItem('cart', JSON.stringify(val))
}, { deep: true })

export function useCart() {
  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + (i.price * i.quantity), 0))

  function addToCart(product) {
    const existing = items.value.find(i => i.productId === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
        stock: product.stock
      })
    }
  }

  function removeFromCart(productId) {
    items.value = items.value.filter(i => i.productId !== productId)
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      if (quantity <= 0) removeFromCart(productId)
      else item.quantity = Math.min(quantity, item.stock)
    }
  }

  function clearCart() {
    items.value = []
    localStorage.removeItem('cart')
  }

  return { items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }
}