import { SunIcon as Sunburst } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-ash-400 hover:text-ember-400 hover:bg-base-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ember-500/50"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <Sunburst className={`w-5 h-5 ${theme === 'dark' ? 'text-ash-400' : 'text-ember-500'}`} />
    </button>
  )
}
