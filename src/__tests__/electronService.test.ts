import { describe, it, expect, vi, beforeEach } from 'vitest'
import { electronService } from '@/services/electron.service'

describe('electronService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be a singleton', () => {
    const instance1 = electronService
    const instance2 = electronService
    expect(instance1).toBe(instance2)
  })

  it('should call window.api.getStats', async () => {
    const mockStats = {
      totalCertificados: 3,
      totalDocumentos: 1500,
      totalRetido: 12500.5,
      ultimaSincronizacao: '2024-01-15T10:30:00Z'
    }
    vi.mocked(window.api.getStats).mockResolvedValue(mockStats)

    const result = await electronService.getStats()
    expect(result).toEqual(mockStats)
    expect(window.api.getStats).toHaveBeenCalledOnce()
  })

  it('should call window.api.getCertificates', async () => {
    const mockCerts = [
      {
        id: '1',
        razao_social: 'Empresa Teste',
        cnpj: '12345678000190',
        caminho_pfx: '/path/to/cert.pfx',
        senha: 'senha123',
        validade_cert: '2025-12-31',
        sinc_automatica: true,
        ultimo_nsu: 12345
      }
    ]
    vi.mocked(window.api.getCertificates).mockResolvedValue(mockCerts)

    const result = await electronService.getCertificates()
    expect(result).toEqual(mockCerts)
    expect(window.api.getCertificates).toHaveBeenCalledOnce()
  })

  it('should call window.api.getConfig', async () => {
    const mockConfig = {
      baseDir: '/home/user/Documents',
      intervalo: 12,
      delayThrottle: 2.0
    }
    vi.mocked(window.api.getConfig).mockResolvedValue(mockConfig as any)

    const result = await electronService.getConfig()
    expect(result).toEqual(mockConfig)
    expect(window.api.getConfig).toHaveBeenCalledOnce()
  })

  it('should call window.api.startSync with ids', async () => {
    vi.mocked(window.api.startSync).mockResolvedValue({ queued: 3 })

    await electronService.startSync(['1', '2', '3'])
    expect(window.api.startSync).toHaveBeenCalledWith(['1', '2', '3'])
  })

  it('should call window.api.stopSync', () => {
    vi.mocked(window.api.stopSync).mockReturnValue(undefined)

    electronService.stopSync()
    expect(window.api.stopSync).toHaveBeenCalledOnce()
  })

  it('should call window.api.backupExport', async () => {
    vi.mocked(window.api.backupExport).mockResolvedValue(true)

    const result = await electronService.backupExport()
    expect(result).toBe(true)
    expect(window.api.backupExport).toHaveBeenCalledOnce()
  })

  it('should call window.api.backupImport', async () => {
    vi.mocked(window.api.backupImport).mockResolvedValue(true)

    const result = await electronService.backupImport()
    expect(result).toBe(true)
    expect(window.api.backupImport).toHaveBeenCalledOnce()
  })

  it('should call window.api.selectBaseFolder', async () => {
    vi.mocked(window.api.selectBaseFolder).mockResolvedValue('/home/user/Documents')

    const result = await electronService.selectBaseFolder()
    expect(result).toBe('/home/user/Documents')
    expect(window.api.selectBaseFolder).toHaveBeenCalledOnce()
  })

  it('should call window.api.openBaseFolder', async () => {
    vi.mocked(window.api.openBaseFolder).mockResolvedValue(undefined)

    await electronService.openBaseFolder()
    expect(window.api.openBaseFolder).toHaveBeenCalledOnce()
  })

  it('should call window.api.getSyncHistory', async () => {
    const mockHistory = [
      {
        id: '1',
        data_inicio: '2024-01-15T10:30:00Z',
        razao_social: 'Empresa Teste',
        documentos_processados: 100,
        retencoes_encontradas: 5,
        nsu_final: 12345,
        status: 'SUCESSO'
      }
    ]
    vi.mocked(window.api.getSyncHistory).mockResolvedValue(mockHistory)

    const result = await electronService.getSyncHistory()
    expect(result).toEqual(mockHistory)
    expect(window.api.getSyncHistory).toHaveBeenCalledOnce()
  })

  it('should call window.api.deleteCertificate', async () => {
    vi.mocked(window.api.deleteCertificate).mockResolvedValue(undefined)

    await electronService.deleteCertificate('1')
    expect(window.api.deleteCertificate).toHaveBeenCalledWith('1')
  })

  it('should call window.api.updateCertificate', async () => {
    const updateData = {
      id: '1',
      razao_social: 'Empresa Atualizada',
      cnpj: '12345678000190'
    }
    vi.mocked(window.api.updateCertificate).mockResolvedValue(undefined)

    await electronService.updateCertificate(updateData)
    expect(window.api.updateCertificate).toHaveBeenCalledWith(updateData)
  })
})
