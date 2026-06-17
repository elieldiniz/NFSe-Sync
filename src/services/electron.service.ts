import type {
  Certificado,
  CertificadoCreate,
  CertificadoUpdate,
  CertInfo,
  BatchResult,
  AppConfig,
  ConfigUpdate,
  DashboardStats,
  SyncRecord,
  SyncError,
  SyncProgressData,
  SyncQueueUpdateData
} from '@/types'

type SyncProgressCallback = (data: SyncProgressData) => void
type SyncQueueUpdateCallback = (data: SyncQueueUpdateData) => void
type SyncQueueCompleteCallback = (data: { message: string }) => void

interface ElectronApi {
  pingDb: () => Promise<boolean>
  checkFirstRun: () => Promise<boolean>
  selectBaseFolder: () => Promise<string | null>
  saveBaseFolder: (pastaBase: string) => Promise<void>
  getConfig: () => Promise<AppConfig | null>
  updateConfig: (config: ConfigUpdate) => Promise<void>
  getCertificates: () => Promise<Certificado[]>
  saveCertificate: (cert: CertificadoCreate) => Promise<string>
  extractCertInfo: (pfxPath: string, password: string) => Promise<CertInfo & { error?: string }>
  selectPfxFile: () => Promise<string | null>
  deleteCertificate: (id: string) => Promise<void>
  updateCertificate: (cert: CertificadoUpdate) => Promise<void>
  resetCertificate: (id: string) => Promise<void>
  addBatchCerts: (data: { files: string[]; senhas: string[] }) => Promise<BatchResult[]>
  startSync: (ids: string[]) => Promise<{ queued: number }>
  startSyncAll: () => Promise<{ queued: number } | { message: string }>
  stopSync: () => void
  getSyncQueue: () => Promise<Array<{ certificadoId: string; status: string }>>
  onSyncProgress: (callback: SyncProgressCallback) => void
  onSyncQueueUpdate: (callback: SyncQueueUpdateCallback) => void
  onSyncQueueComplete: (callback: SyncQueueCompleteCallback) => void
  removeSyncListeners: () => void
  getSyncHistory: () => Promise<SyncRecord[]>
  getSyncErrors: () => Promise<SyncError[]>
  generateRetencoesReport: (certificadoId: string, competencia: string) => Promise<{ pdf: string | null; xlsx: string | null }>
  openReport: (filePath: string) => Promise<void>
  getStats: () => Promise<DashboardStats>
  backupExport: () => Promise<boolean>
  backupImport: () => Promise<boolean>
  openBaseFolder: () => Promise<void>
}

declare global {
  interface Window {
    api: ElectronApi
  }
}

class ElectronService {
  private get api(): ElectronApi {
    return window.api
  }

  async pingDb(): Promise<boolean> {
    return this.api.pingDb()
  }

  async checkFirstRun(): Promise<boolean> {
    return this.api.checkFirstRun()
  }

  async selectBaseFolder(): Promise<string | null> {
    return this.api.selectBaseFolder()
  }

  async saveBaseFolder(pastaBase: string): Promise<void> {
    return this.api.saveBaseFolder(pastaBase)
  }

  async getConfig(): Promise<AppConfig | null> {
    return this.api.getConfig()
  }

  async updateConfig(config: ConfigUpdate): Promise<void> {
    return this.api.updateConfig(config)
  }

  async getCertificates(): Promise<Certificado[]> {
    return this.api.getCertificates()
  }

  async saveCertificate(cert: CertificadoCreate): Promise<string> {
    return this.api.saveCertificate(cert)
  }

  async extractCertInfo(pfxPath: string, password: string): Promise<CertInfo & { error?: string }> {
    return this.api.extractCertInfo(pfxPath, password)
  }

  async selectPfxFile(): Promise<string | null> {
    return this.api.selectPfxFile()
  }

  async deleteCertificate(id: string): Promise<void> {
    return this.api.deleteCertificate(id)
  }

  async updateCertificate(cert: CertificadoUpdate): Promise<void> {
    return this.api.updateCertificate(cert)
  }

  async resetCertificate(id: string): Promise<void> {
    return this.api.resetCertificate(id)
  }

  async addBatchCerts(data: { files: string[]; senhas: string[] }): Promise<BatchResult[]> {
    return this.api.addBatchCerts(data)
  }

  async startSync(ids: string[]): Promise<{ queued: number }> {
    return this.api.startSync(ids)
  }

  async startSyncAll(): Promise<{ queued: number } | { message: string }> {
    return this.api.startSyncAll()
  }

  stopSync(): void {
    this.api.stopSync()
  }

  async getSyncQueue(): Promise<Array<{ certificadoId: string; status: string }>> {
    return this.api.getSyncQueue()
  }

  onSyncProgress(callback: SyncProgressCallback): void {
    this.api.onSyncProgress(callback)
  }

  onSyncQueueUpdate(callback: SyncQueueUpdateCallback): void {
    this.api.onSyncQueueUpdate(callback)
  }

  onSyncQueueComplete(callback: SyncQueueCompleteCallback): void {
    this.api.onSyncQueueComplete(callback)
  }

  removeSyncListeners(): void {
    this.api.removeSyncListeners()
  }

  async getSyncHistory(): Promise<SyncRecord[]> {
    return this.api.getSyncHistory()
  }

  async getSyncErrors(): Promise<SyncError[]> {
    return this.api.getSyncErrors()
  }

  async generateRetencoesReport(certificadoId: string, competencia: string): Promise<{ pdf: string | null; xlsx: string | null }> {
    return this.api.generateRetencoesReport(certificadoId, competencia)
  }

  async openReport(filePath: string): Promise<void> {
    return this.api.openReport(filePath)
  }

  async getStats(): Promise<DashboardStats> {
    return this.api.getStats()
  }

  async backupExport(): Promise<boolean> {
    return this.api.backupExport()
  }

  async backupImport(): Promise<boolean> {
    return this.api.backupImport()
  }

  async openBaseFolder(): Promise<void> {
    return this.api.openBaseFolder()
  }
}

export const electronService = new ElectronService()
