import { create } from 'zustand'
import type { Certificado } from '@/types'

interface CertState {
  certificados: Certificado[]
  loading: boolean
  setCertificados: (certs: Certificado[]) => void
  setLoading: (loading: boolean) => void
  addCertificado: (cert: Certificado) => void
  removeCertificado: (id: string) => void
}

export const useCertStore = create<CertState>((set) => ({
  certificados: [],
  loading: false,
  setCertificados: (certs) => set({ certificados: certs }),
  setLoading: (loading) => set({ loading }),
  addCertificado: (cert) =>
    set((state) => ({ certificados: [...state.certificados, cert] })),
  removeCertificado: (id) =>
    set((state) => ({
      certificados: state.certificados.filter((c) => c.id !== id)
    }))
}))
