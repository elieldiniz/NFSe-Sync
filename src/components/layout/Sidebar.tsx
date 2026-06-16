import {
  IconLayoutDashboard,
  IconCertificate,
  IconHistory,
  IconHelpCircle,
  IconSettings,
  IconCircleFilled
} from '@tabler/icons-react'

type Page = 'dashboard' | 'certs' | 'syncs' | 'help' | 'config'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

const menuSections = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard' as Page, label: 'Dashboard', icon: IconLayoutDashboard },
      { id: 'certs' as Page, label: 'Certificados', icon: IconCertificate },
      { id: 'syncs' as Page, label: 'Sincronizações', icon: IconHistory }
    ]
  },
  {
    label: 'Ferramentas',
    items: [
      { id: 'help' as Page, label: 'Ajuda / Guia', icon: IconHelpCircle },
      { id: 'config' as Page, label: 'Configurações', icon: IconSettings }
    ]
  }
]

export function Sidebar({ activePage, onNavigate }: SidebarProps): React.JSX.Element {
  return (
    <aside id="sidebar" className="w-[240px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="sb-logo px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="text-[15px] font-medium text-gray-900">
          NFS<span className="text-blue">e</span> Sync
        </div>
        <div className="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5">
          v2.2 · Desktop
        </div>
      </div>

      <nav className="sb-nav flex-1 overflow-y-auto py-2 px-2">
        {menuSections.map((section) => (
          <div key={section.label}>
            <div className="sb-sec text-[9px] uppercase tracking-[1.5px] text-gray-400 px-2 pt-2.5 pb-1 font-mono">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-[7px] rounded-md cursor-pointer text-[13px] mb-px transition-colors ${
                    activePage === item.id
                      ? 'bg-blue-light text-blue font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
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

      <div className="sb-tray border-t border-gray-200 py-2.5 px-3 flex items-center gap-1.5 text-[11px] text-gray-400">
        <IconCircleFilled size={14} className="text-green" />
        <span>System Tray ativo</span>
      </div>
    </aside>
  )
}

export type { Page }
