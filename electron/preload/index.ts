import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // Core
  pingDb: () => ipcRenderer.invoke('ping-db'),
  checkFirstRun: () => ipcRenderer.invoke('check-first-run'),
  selectBaseFolder: () => ipcRenderer.invoke('select-base-folder'),
  saveBaseFolder: (pastaBase: string) => ipcRenderer.invoke('save-base-folder', pastaBase),

  // Config
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (config: { delay_throttle?: number; sinc_intervalo_horas?: number }) =>
    ipcRenderer.invoke('update-config', config),

  // Certificates
  getCertificates: () => ipcRenderer.invoke('get-certificates'),
  saveCertificate: (cert: {
    cnpj: string
    razao_social: string
    caminho_pfx: string
    senha: string
    validade_cert: string
  }) => ipcRenderer.invoke('save-certificate', cert),
  extractCertInfo: (pfxPath: string, password: string) =>
    ipcRenderer.invoke('extract-cert-info', pfxPath, password),
  selectPfxFile: () => ipcRenderer.invoke('select-pfx-file'),
  deleteCertificate: (id: string) => ipcRenderer.invoke('delete-certificate', id),
  updateCertificate: (cert: { id: string; cnpj?: string; razao_social?: string; caminho_pfx?: string; senha?: string; sinc_automatica?: boolean }) =>
    ipcRenderer.invoke('update-certificate', cert),
  resetCertificate: (id: string) => ipcRenderer.invoke('reset-certificate', id),
  addBatchCerts: (data: { files: string[]; senhas: string[] }) =>
    ipcRenderer.invoke('add-batch-certs', data),

  // Sync
  startSync: (ids: string[]) => ipcRenderer.invoke('start-sync', ids),
  startSyncAll: () => ipcRenderer.invoke('start-sync-all'),
  stopSync: () => ipcRenderer.invoke('stop-sync'),
  getSyncQueue: () => ipcRenderer.invoke('get-sync-queue'),
  onSyncProgress: (callback: (data: unknown) => void) => {
    ipcRenderer.on('sync:progress', (_, data) => callback(data))
  },
  onSyncQueueUpdate: (callback: (data: unknown) => void) => {
    ipcRenderer.on('sync:queue-update', (_, data) => callback(data))
  },
  onSyncQueueComplete: (callback: (data: unknown) => void) => {
    ipcRenderer.on('sync:queue-complete', (_, data) => callback(data))
  },
  removeSyncListeners: () => {
    ipcRenderer.removeAllListeners('sync:progress')
    ipcRenderer.removeAllListeners('sync:queue-update')
    ipcRenderer.removeAllListeners('sync:queue-complete')
  },

  // Reports
  getSyncHistory: () => ipcRenderer.invoke('get-sync-history'),
  getSyncErrors: () => ipcRenderer.invoke('get-sync-errors'),
  generateRetencoesReport: (certificadoId: string, competencia: string) =>
    ipcRenderer.invoke('generate-retencoes-report', certificadoId, competencia),
  openReport: (filePath: string) => ipcRenderer.invoke('report:open', filePath),

  // Stats
  getStats: () => ipcRenderer.invoke('get-stats'),

  // Backup
  backupExport: () => ipcRenderer.invoke('backup:export'),
  backupImport: () => ipcRenderer.invoke('backup:import'),

  // System
  openBaseFolder: () => ipcRenderer.invoke('open-base-folder')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
