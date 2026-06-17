import '@testing-library/jest-dom'

const localStorageStore = new Map<string, string>()

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => localStorageStore.set(key, value)),
  removeItem: vi.fn((key: string) => localStorageStore.delete(key)),
  clear: vi.fn(() => localStorageStore.clear())
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

const apiMock = {
  pingDb: vi.fn(),
  checkFirstRun: vi.fn(),
  selectBaseFolder: vi.fn(),
  saveBaseFolder: vi.fn(),
  getConfig: vi.fn(),
  updateConfig: vi.fn(),
  getCertificates: vi.fn(),
  saveCertificate: vi.fn(),
  extractCertInfo: vi.fn(),
  selectPfxFile: vi.fn(),
  deleteCertificate: vi.fn(),
  updateCertificate: vi.fn(),
  resetCertificate: vi.fn(),
  addBatchCerts: vi.fn(),
  startSync: vi.fn(),
  startSyncAll: vi.fn(),
  stopSync: vi.fn(),
  getSyncQueue: vi.fn(),
  onSyncProgress: vi.fn(),
  onSyncQueueUpdate: vi.fn(),
  onSyncQueueComplete: vi.fn(),
  removeSyncListeners: vi.fn(),
  getSyncHistory: vi.fn(),
  getSyncErrors: vi.fn(),
  generateRetencoesReport: vi.fn(),
  openReport: vi.fn(),
  getStats: vi.fn(),
  backupExport: vi.fn(),
  backupImport: vi.fn(),
  openBaseFolder: vi.fn()
}

Object.defineProperty(window, 'api', { value: apiMock })
