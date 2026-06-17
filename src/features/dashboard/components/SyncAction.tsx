import { memo, useCallback } from 'react'
import { IconRefresh } from '@tabler/icons-react'

interface SyncActionProps {
  onSyncClick: () => void
}

export const SyncAction = memo(function SyncAction({ onSyncClick }: SyncActionProps): React.JSX.Element {
  return (
    <div className="sync-hero text-center py-8 pb-6">
      <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-5">
        Clique para sincronizar suas empresas com a Sefaz Nacional.
      </p>
      <button
        onClick={onSyncClick}
        className="btn-sync text-[15px] font-medium py-3 px-8 rounded-xl bg-blue text-white border-none cursor-pointer inline-flex items-center gap-2 transition-all hover:bg-blue-dark hover:-translate-y-px font-sans"
      >
        <IconRefresh size={18} />
        Sincronizar Agora
      </button>
    </div>
  )
})
