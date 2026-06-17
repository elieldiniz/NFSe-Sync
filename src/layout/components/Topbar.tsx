import { memo } from 'react'
import { IconSun, IconMoon } from '@tabler/icons-react'
import { useThemeStore } from '@/store/theme.store'

interface TopbarProps {
  title: string
  subtitle: string
}

export const Topbar = memo(function Topbar({ title, subtitle }: TopbarProps): React.JSX.Element {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="topbar h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-5 gap-2 flex-shrink-0">
      <span className="topbar-title text-sm font-medium dark:text-gray-100">{title}</span>
      <span className="topbar-sep text-gray-300 dark:text-gray-600">·</span>
      <span className="topbar-sub text-xs text-gray-600 dark:text-gray-400">{subtitle}</span>
      <div className="flex-1" />
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
      >
        {theme === 'dark' ? (
          <IconSun size={16} className="text-amber" />
        ) : (
          <IconMoon size={16} className="text-gray-500" />
        )}
      </button>
    </div>
  )
})
