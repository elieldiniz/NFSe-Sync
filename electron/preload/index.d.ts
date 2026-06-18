import { ElectronAPI } from '@electron-toolkit/preload'
import {
  Configuracao,
  Certificado,
  Stats,
  SincronizacaoComEmpresa,
  SyncErroComEmpresa,
  SyncQueueItem,
  CertificateSave,
  CertificateUpdate,
  ConfigUpdate,
  BatchCertData,
  BatchCertResult
} from '../db/types'

interface Api {
  pingDb: () => Promise<boolean>
  checkFirstRun: () => Promise<boolean>
  selectBaseFolder: () => Promise<string | null>
  saveBaseFolder: (pastaBase: string) => Promise<void>
  getConfig: () => Promise<Configuracao | null>
  updateConfig: (config: ConfigUpdate) => Promise<void>
  getCertificates: () => Promise<Certificado[]>
  saveCertificate: (cert: CertificateSave) => Promise<string>
  extractCertInfo: (pfxPath: string, password: string) => Promise<{ cnpj: string; razao_social: string; validade_cert: string } | { error: string }>
  selectPfxFile: () => Promise<string | null>
  deleteCertificate: (id: string) => Promise<void>
  updateCertificate: (cert: CertificateUpdate) => Promise<void>
  resetCertificate: (id: string) => Promise<void>
  addBatchCerts: (data: BatchCertData) => Promise<BatchCertResult[]>
  startSync: (ids: string[]) => Promise<{ queued: number }>
  startSyncAll: () => Promise<{ queued: number } | { message: string }>
  stopSync: () => Promise<void>
  getSyncQueue: () => Promise<SyncQueueItem[]>
  onSyncProgress: (callback: (data: any) => void) => void
  onSyncQueueUpdate: (callback: (data: any) => void) => void
  onSyncQueueComplete: (callback: (data: any) => void) => void
  removeSyncListeners: () => void
  getSyncHistory: () => Promise<SincronizacaoComEmpresa[]>
  getSyncErrors: () => Promise<SyncErroComEmpresa[]>
  generateRetencoesReport: (certificadoId: string, competencia: string) => Promise<{ pdf: string | null; xlsx: string | null }>
  openReport: (filePath: string) => Promise<void>
  generateReportManual: (certificadoId: string, competencia: string) => Promise<{ pdf: string | null; xlsx: string | null }>
  getCompetencias: (certificadoId: string) => Promise<Array<{ competencia: string; fechada: boolean }>>
  getStatsEmpresa: (certificadoId: string) => Promise<{ totalDocumentos: number; emitidos: number; recebidos: number; comRetencao: number; valorTotal: number }>
  getRetencoesEmpresa: (certificadoId: string) => Promise<{ iss: number; inss: number; irrf: number; pis: number; cofins: number; csll: number; total: number }>
  getStats: () => Promise<Stats>
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
