import { useState } from 'react'
import { Sidebar, Page } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { Dashboard } from './components/dashboard/Dashboard'
import { CertificadosPage } from './components/pages/CertificadosPage'
import { SincronizacoesPage } from './components/pages/SincronizacoesPage'
import { ConfiguracoesPage } from './components/pages/ConfiguracoesPage'
import { HelpPage } from './components/pages/HelpPage'

const pageConfig: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral' },
  certs: { title: 'Certificados', subtitle: 'Gerenciar certificados digitais' },
  syncs: { title: 'Sincronizações', subtitle: 'Histórico de operações' },
  help: { title: 'Ajuda / Guia', subtitle: 'Documentação offline e glossário' },
  config: { title: 'Configurações', subtitle: 'Pasta base, automação, backup' }
}

function App(): React.JSX.Element {
  const [page, setPage] = useState<Page>('dashboard')

  const handleSync = () => {
    // TODO: Trigger actual sync in Phase 5
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />
      case 'certs':
        return <CertificadosPage />
      case 'syncs':
        return <SincronizacoesPage />
      case 'help':
        return <HelpPage />
      case 'config':
        return <ConfiguracoesPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div id="main" className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={pageConfig[page].title} subtitle={pageConfig[page].subtitle} />
        {renderPage()}
      </div>
    </div>
  )
}

export default App
