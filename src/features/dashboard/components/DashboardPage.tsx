import { useSyncStore } from '@/store/sync.store'
import { useDashboard } from '../hooks/useDashboard'
import { useStatsQuery } from '../hooks/useStatsQuery'
import { StatsGrid } from './StatsGrid'
import { SyncAction } from './SyncAction'
import { QueuePanel } from './QueuePanel'
import { SyncSelectModal } from '@/features/sync/components/SyncSelectModal'

export function DashboardPage(): React.JSX.Element {
  const { isSyncing } = useSyncStore()
  const { data: stats } = useStatsQuery()
  const { showModal, setShowModal, handleSyncClick, handleStartSync } = useDashboard()

  return (
    <div className="p-6 max-w-[960px] mx-auto">
      <StatsGrid stats={stats} />

      {isSyncing && <QueuePanel />}

      {!isSyncing && <SyncAction onSyncClick={handleSyncClick} />}

      {showModal && (
        <SyncSelectModal onClose={() => setShowModal(false)} onStart={handleStartSync} />
      )}
    </div>
  )
}
