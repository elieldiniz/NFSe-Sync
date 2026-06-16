import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  pingDb: () => Promise<boolean>
  checkFirstRun: () => Promise<boolean>
  selectBaseFolder: () => Promise<string | null>
  saveBaseFolder: (pastaBase: string) => Promise<void>
  getConfig: () => Promise<any>
  updateConfig: (config: { delay_throttle?: number; sinc_intervalo_horas?: number }) => Promise<void>
  getCertificates: () => Promise<any[]>
  saveCertificate: (cert: {
    cnpj: string
    razao_social: string
    caminho_pfx: string
    senha: string
    validade_cert: string
  }) => Promise<string>
  extractCertInfo: (pfxPath: string, password: string) => Promise<any>
  selectPfxFile: () => Promise<string | null>
  deleteCertificate: (id: string) => Promise<void>
  updateCertificate: (cert: { id: string; cnpj?: string; razao_social?: string; caminho_pfx?: string; senha?: string; sinc_automatica?: boolean }) => Promise<void>
  resetCertificate: (id: string) => Promise<void>
  addBatchCerts: (data: { files: string[]; senhas: string[] }) => Promise<any[]>
  startSync: (ids: string[]) => Promise<any>
  startSyncAll: () => Promise<any>
  stopSync: () => Promise<void>
  getSyncQueue: () => Promise<any[]>
  onSyncProgress: (callback: (data: any) => void) => void
  onSyncQueueUpdate: (callback: (data: any) => void) => void
  onSyncQueueComplete: (callback: (data: any) => void) => void
  removeSyncListeners: () => void
  getSyncHistory: () => Promise<any[]>
  getSyncErrors: () => Promise<any[]>
  generateRetencoesReport: (certificadoId: string, competencia: string) => Promise<{ pdf: string | null; xlsx: string | null }>
  openReport: (filePath: string) => Promise<void>
  getStats: () => Promise<any>
  backupExport: () => Promise<boolean>
  backupImport: () => Promise<boolean>
  openBaseFolder: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
