import { ref } from 'vue'
import { useOsTheme } from 'naive-ui'

export function useTheme() {
  const osTheme = useOsTheme()
  const isDark = ref(osTheme.value === 'dark')

  const toggleDark = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDark
  }
} 