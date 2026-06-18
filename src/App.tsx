import { lazy, Suspense, useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar, Topbar } from '@/layout/components'
import { ErrorBoundary } from '@/shared/components'
import { electronService } from '@/services/electron.service'
import { WizardOnboarding } from '@/features/onboarding'

const DashboardPage = lazy(() => import('@/features/dashboard').then((m) => ({ default: m.DashboardPage })))
const CertificadosPage = lazy(() => import('@/features/certificates').then((m) => ({ default: m.CertificadosPage })))
const SincronizacoesPage = lazy(() => import('@/features/sync').then((m) => ({ default: m.SincronizacoesPage })))
const RelatoriosPage = lazy(() => import('@/features/reports').then((m) => ({ default: m.RelatoriosPage })))
const EmpresaDashboard = lazy(() => import('@/features/empresa').then((m) => ({ default: m.EmpresaDashboard })))
const ConfiguracoesPage = lazy(() => import('@/features/settings').then((m) => ({ default: m.ConfiguracoesPage })))
const HelpPage = lazy(() => import('@/features/help').then((m) => ({ default: m.HelpPage })))

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral' },
  '/certs': { title: 'Certificados', subtitle: 'Gerenciar certificados digitais' },
  '/syncs': { title: 'Sincronizações', subtitle: 'Histórico de operações' },
  '/reports': { title: 'Relatórios', subtitle: 'Relatórios de retenções por competência' },
  '/help': { title: 'Ajuda / Guia', subtitle: 'Documentação offline e glossário' },
  '/config': { title: 'Configurações', subtitle: 'Pasta base, automação, backup' }
}

function LoadingFallback(): React.JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-gray-400 text-[13px]">Carregando...</div>
    </div>
  )
}

function App(): React.JSX.Element {
  const location = useLocation()
  const [firstRun, setFirstRun] = useState<boolean | null>(null)

  useEffect(() => {
    electronService.checkFirstRun().then(setFirstRun)
  }, [])

  if (firstRun === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-400 text-[13px]">Carregando...</div>
      </div>
    )
  }

  if (firstRun) {
    return <WizardOnboarding onComplete={() => setFirstRun(false)} />
  }

  const pageInfo = pageConfig[location.pathname] || pageConfig['/']

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar currentPath={location.pathname} />
      <div id="main" className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <ErrorBoundary featureName={pageInfo.title}>
          <Suspense fallback={<LoadingFallback />}>
            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/certs" element={<CertificadosPage />} />
                <Route path="/empresa/:id" element={<EmpresaDashboard />} />
                <Route path="/syncs" element={<SincronizacoesPage />} />
                <Route path="/reports" element={<RelatoriosPage />} />
                <Route path="/config" element={<ConfiguracoesPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App
