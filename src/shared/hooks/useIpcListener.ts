import { useEffect, useRef } from 'react'

type CleanupFn = () => void

export function useIpcListener(
  setup: () => CleanupFn | void,
  deps: React.DependencyList = []
): void {
  const cleanupRef = useRef<CleanupFn | null>(null)

  useEffect(() => {
    if (cleanupRef.current) {
      cleanupRef.current()
    }
    cleanupRef.current = setup() || null

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, deps)
}
