import { memo, type ReactNode, useEffect, useCallback } from 'react'
import { IconX } from '@tabler/icons-react'

interface ModalProps {
  onClose: () => void
  title: string
  width?: string
  children: ReactNode
}

export const Modal = memo(function Modal({ onClose, title, width = 'w-[480px]', children }: ModalProps): React.JSX.Element {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      className="modal-bg absolute inset-0 bg-black/38 flex items-center justify-center rounded-xl z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 ${width}`}>
        <div className="modal-title text-[15px] font-medium mb-3.5 flex items-center justify-between dark:text-gray-100">
          {title}
          <button
            onClick={onClose}
            className="bg-none border-none cursor-pointer text-gray-400 dark:text-gray-500 text-lg p-0.5 leading-none hover:text-gray-900 dark:hover:text-gray-100"
          >
            <IconX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
})

interface ModalFooterProps {
  children: ReactNode
}

export const ModalFooter = memo(function ModalFooter({ children }: ModalFooterProps): React.JSX.Element {
  return (
    <div className="modal-footer flex justify-end gap-2 mt-4 pt-3.5 border-t border-gray-200 dark:border-gray-700">
      {children}
    </div>
  )
})
