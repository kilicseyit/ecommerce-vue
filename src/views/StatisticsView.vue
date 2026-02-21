<template>
  <div>
    <div class="page-header">
      <h1>📊 İstatistikler</h1>
    </div>

    <p v-if="loading" class="loading">Yükleniyor...</p>

    <div v-else class="stats-grid">
      <!-- Sipariş Durumu -->
      <div class="chart-card">
        <h3>📦 Sipariş Durumları</h3>
        <canvas ref="orderChartRef"></canvas>
      </div>

      <!-- Aylık Satış -->
      <div class="chart-card">
        <h3>📈 Aylık Satışlar</h3>
        <canvas ref="salesChartRef"></canvas>
      </div>

      <!-- Kategori Dağılımı -->
      <div class="chart-card">
        <h3>🏷️ Kategoriye Göre Ürünler</h3>
        <canvas ref="categoryChartRef"></canvas>
      </div>

      <!-- En Çok Satan Ürünler -->
      <div class="chart-card">
        <h3>🏆 En Çok Satan Ürünler</h3>
        <canvas ref="topProductsChartRef"></canvas>
      </div>
      <div class="chart-card">
  <h3>❤️ En Çok Favorilenen Ürünler</h3>
  <canvas ref="favChartRef"></canvas>
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { orderService } from '../services/orderService'
import { productService } from '../services/productService'
import { authService } from '../services/authService'
import { useToast } from '../stores/toast'


Chart.register(...registerables)

const { show } = useToast()
const loading = ref(true)
const isAdmin = ref(authService.isAdmin())
const favChartRef = ref(null)

const orderChartRef = ref(null)
const salesChartRef = ref(null)
const categoryChartRef = ref(null)
const topProductsChartRef = ref(null)

async function fetchAndRender() {
  try {
    const [ordersRes, productsRes] = await Promise.all([
       isAdmin.value ? orderService.getAll() : orderService.getMySales(),
         isAdmin.value ? productService.getAll() : productService.getMyProducts()
    ])

    const orders = ordersRes.data
    const products = productsRes.data

    loading.value = false
    await nextTick()

    // Sipariş Durumu Pie Chart
    const statusCounts = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 }
    orders.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++ })

    new Chart(orderChartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['⏳ Bekliyor', '⚙️ İşleniyor', '🚚 Kargoda', '✅ Teslim', '❌ İptal'],
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#fef08a', '#bfdbfe', '#e0f2fe', '#bbf7d0', '#fecaca'],
          borderColor: ['#eab308', '#3b82f6', '#0ea5e9', '#22c55e', '#ef4444'],
          borderWidth: 2
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    })

    const monthlySales = Array(12).fill(0)
    orders.forEach(o => {
      const month = new Date(o.createdAt).getMonth()
      monthlySales[month] += o.totalPrice
    })

    new Chart(salesChartRef.value, {
      type: 'bar',
      data: {
        labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        datasets: [{
          label: 'Satış (₺)',
          data: monthlySales,
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: '#6366f1',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } }
        }
      }
    })

    const categoryCounts = {}
    products.forEach(p => {
      categoryCounts[p.categoryName] = (categoryCounts[p.categoryName] || 0) + 1
    })

    new Chart(categoryChartRef.value, {
      type: 'pie',
      data: {
        labels: Object.keys(categoryCounts),
        datasets: [{
          data: Object.values(categoryCounts),
          backgroundColor: ['#818cf8', '#34d399', '#f472b6', '#fb923c', '#60a5fa', '#a78bfa'],
          borderWidth: 2
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    })

    const productSales = {}
    orders.forEach(o => {
      o.orderItems?.forEach(item => {
        productSales[item.productName] = (productSales[item.productName] || 0) + item.quantity
      })
    })

    const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5)

    new Chart(topProductsChartRef.value, {
      type: 'bar',
      data: {
        labels: sorted.map(s => s[0]),
        datasets: [{
          label: 'Satış Adedi',
          data: sorted.map(s => s[1]),
          backgroundColor: 'rgba(52, 211, 153, 0.7)',
          borderColor: '#34d399',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } }
        }
      }
    })
    
const favProducts = products
      .filter(p => p.favoriteCount > 0)
      .sort((a, b) => b.favoriteCount - a.favoriteCount)
      .slice(0, 5)

    if (favProducts.length > 0) {
      new Chart(favChartRef.value, {
        type: 'bar',
        data: {
          labels: favProducts.map(p => p.name),
          datasets: [{
            label: 'Favori Sayısı',
            data: favProducts.map(p => p.favoriteCount),
            backgroundColor: 'rgba(244, 114, 182, 0.7)',
            borderColor: '#f472b6',
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { labels: { color: '#94a3b8' } } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } }
          }
        }
      })
    }

  } catch {
    show('İstatistikler yüklenemedi!', 'error')
  }
}

onMounted(fetchAndRender)
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.loading { text-align: center; padding: 80px; color: var(--text-secondary); }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.chart-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; max-height: 300px; }
.chart-card h3 { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }
.chart-card canvas { max-height: 220px; }
</style>