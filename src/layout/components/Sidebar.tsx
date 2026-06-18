import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconCertificate,
  IconHistory,
  IconReport,
  IconHelpCircle,
  IconSettings,
  IconCircleFilled
} from '@tabler/icons-react'

interface SidebarProps {
  currentPath: string
}

const menuSections = [
  {
    label: 'Principal',
    items: [
      { path: '/', label: 'Dashboard', icon: IconLayoutDashboard },
      { path: '/certs', label: 'Certificados', icon: IconCertificate },
      { path: '/syncs', label: 'Sincronizações', icon: IconHistory },
      { path: '/reports', label: 'Relatórios', icon: IconReport }
    ]
  },
  {
    label: 'Ferramentas',
    items: [
      { path: '/help', label: 'Ajuda / Guia', icon: IconHelpCircle },
      { path: '/config', label: 'Configurações', icon: IconSettings }
    ]
  }
]

export const Sidebar = memo(function Sidebar({ currentPath }: SidebarProps): React.JSX.Element {
  const navigate = useNavigate()

  const handleNavigate = useCallback((path: string) => {
    navigate(path)
  }, [navigate])

  return (
    <aside id="sidebar" className="w-[240px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      <div className="sb-logo px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="text-[15px] font-medium text-gray-900 dark:text-gray-100">
          NFS<span className="text-blue">e</span> Sync
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-wider mt-0.5">
          v2.2 · Desktop
        </div>
      </div>

      <nav className="sb-nav flex-1 overflow-y-auto py-2 px-2">
        {menuSections.map((section) => (
          <div key={section.label}>
            <div className="sb-sec text-[9px] uppercase tracking-[1.5px] text-gray-400 dark:text-gray-500 px-2 pt-2.5 pb-1 font-mono">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-2 px-2.5 py-[7px] rounded-md cursor-pointer text-[13px] mb-px transition-colors ${
                    currentPath === item.path
                      ? 'bg-blue-light dark:bg-blue/20 text-blue font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.5} />
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sb-tray border-t border-gray-200 dark:border-gray-700 py-2.5 px-3 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
        <IconCircleFilled size={14} className="text-green" />
        <span>System Tray ativo</span>
      </div>
    </aside>
  )
})
