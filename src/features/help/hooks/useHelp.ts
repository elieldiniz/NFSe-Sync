import { useState, useCallback } from 'react'
import { electronService } from '@/services/electron.service'
import type { SyncError } from '@/types'

export function useHelp() {
  const [copied, setCopied] = useState(false)

  const handleOpenFolder = useCallback(() => {
    electronService.openBaseFolder()
  }, [])

  const handleCopyLogs = useCallback(async () => {
    const errors: SyncError[] = await electronService.getSyncErrors()
    if (errors.length === 0) {
      await navigator.clipboard.writeText('Nenhum erro registrado.')
    } else {
      const text = errors
        .map((e) => `[${e.created_at}] NSU ${e.nsu} - ${e.razao_social} (${e.cnpj}): ${e.mensagem}`)
        .join('\n')
      await navigator.clipboard.writeText(text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return { copied, handleOpenFolder, handleCopyLogs }
}
