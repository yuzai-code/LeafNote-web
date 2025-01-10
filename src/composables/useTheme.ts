import { ref, onMounted, watch } from 'vue'

export function useTheme() {
  const isDark = ref(document.documentElement.getAttribute('data-theme') === 'dark')

  // 监听系统主题变化
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const updateTheme = (dark: boolean) => {
    isDark.value = dark
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }

  const toggleDark = () => {
    updateTheme(!isDark.value)
  }

  // 初始化主题
  onMounted(() => {
    // 如果没有设置过主题，则使用系统主题
    if (!document.documentElement.hasAttribute('data-theme')) {
      updateTheme(darkModeMediaQuery.matches)
    }
  })

  // 监听系统主题变化
  darkModeMediaQuery.addEventListener('change', (e) => {
    updateTheme(e.matches)
  })

  // 监听主题变化，保存到 localStorage
  watch(isDark, (dark) => {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  })

  return {
    isDark,
    toggleDark
  }
} 