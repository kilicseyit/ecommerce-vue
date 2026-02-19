import { ref, watch } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

watch(theme, (val) => {
  localStorage.setItem('theme', val)
  document.documentElement.setAttribute('data-theme', val)
})

document.documentElement.setAttribute('data-theme', theme.value)

export function useTheme() {
  return { theme }
}