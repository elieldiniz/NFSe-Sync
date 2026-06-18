import { ipcMain, shell } from 'electron'
import { ReportsService } from '../../services/reports.service'
import { SyncErroRepository } from '../../db/repositories/sync_erros.repository'
import { DocumentoRepository } from '../../db/repositories/documento.repository'
import { isCompetenciaFechada } from '../../utils/competencia'

export function registerReportHandlers(): void {
  ipcMain.handle('generate-retencoes-report', async (_, certificadoId: string, competencia: string) => {
    return ReportsService.gerarRelatorios(certificadoId, competencia)
  })

  ipcMain.handle('report:open', async (_, filePath: string) => {
    await shell.openPath(filePath)
  })

  ipcMain.handle('get-sync-errors', () => {
    return SyncErroRepository.findRecent(100)
  })

  ipcMain.handle('generate-report-manual', async (_, certificadoId: string, competencia: string) => {
    return ReportsService.gerarRelatorios(certificadoId, competencia)
  })

  ipcMain.handle('get-competencias', (_, certificadoId: string) => {
    const competencias = DocumentoRepository.getCompetencias(certificadoId)
    return competencias.map(c => ({
      competencia: c.competencia,
      fechada: isCompetenciaFechada(c.competencia)
    }))
  })

  ipcMain.handle('get-stats-empresa', (_, certificadoId: string) => {
    return DocumentoRepository.getStatsByEmpresa(certificadoId)
  })

  ipcMain.handle('get-retencoes-empresa', (_, certificadoId: string) => {
    return DocumentoRepository.getRetencoesByEmpresa(certificadoId)
  })
}
