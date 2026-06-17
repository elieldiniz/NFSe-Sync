import { useState, useCallback } from 'react'
import { electronService } from '@/services/electron.service'

export function useOnboarding() {
  const [step, setStep] = useState<'welcome' | 'folder' | 'certificate' | 'complete'>('welcome')
  const [baseFolder, setBaseFolder] = useState<string | null>(null)

  const handleSelectFolder = useCallback(async () => {
    const folder = await electronService.selectBaseFolder()
    if (folder) {
      setBaseFolder(folder)
      await electronService.saveBaseFolder(folder)
      setStep('certificate')
    }
  }, [])

  const handleSaveCertificate = useCallback(
    async (cert: {
      cnpj: string
      razao_social: string
      caminho_pfx: string
      senha: string
      validade_cert: string
    }) => {
      await electronService.saveCertificate({
        cnpj: cert.cnpj,
        razao_social: cert.razao_social,
        caminho_pfx: cert.caminho_pfx,
        senha: cert.senha,
        validade_cert: cert.validade_cert
      })
      setStep('complete')
    },
    []
  )

  return {
    step,
    setStep,
    baseFolder,
    handleSelectFolder,
    handleSaveCertificate
  }
}
