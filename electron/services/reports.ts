import { ipcMain, shell } from 'electron'
import { getDb } from '../db/connection'
import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'

interface RetencaoRow {
  numero_nota: string
  data_emissao: string
  nome_prestador: string
  nome_tomador: string
  iss: number
  inss: number
  irrf: number
  pis: number
  cofins: number
  csll: number
  total_retido: number
}

interface Certificado {
  id: string
  cnpj: string
  razao_social: string
}

// RN004/RN005: Query with mandatory status filter
function getRetencoesByCompetencia(certificadoId: string, competencia: string): RetencaoRow[] {
  const db = getDb()
  return db.prepare(`
    SELECT
      d.numero_nota,
      d.data_emissao,
      d.nome_prestador,
      d.nome_tomador,
      r.iss,
      r.inss,
      r.irrf,
      r.pis,
      r.cofins,
      r.csll,
      r.total_retido
    FROM documentos d
    JOIN retencoes r ON r.documento_id = d.id
    WHERE d.status = 'ATIVA'
      AND d.possui_retencao = 1
      AND d.competencia = ?
      AND d.certificado_id = ?
    ORDER BY d.data_emissao
  `).all(competencia, certificadoId) as RetencaoRow[]
}

function getRetencoesPath(pastaBase: string, cnpj: string, razaoSocial: string, competencia: string, ext: 'pdf' | 'xlsx'): string {
  const empresaDir = `${cnpj} - ${razaoSocial}`
  const fileName = `Relatorio_Retencoes_${competencia}.${ext}`
  return path.join(pastaBase, 'NFSENacional', empresaDir, competencia, 'Retencoes', fileName)
}

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// REQ-061: PDF generation
async function gerarPdf(dados: RetencaoRow[], certificado: Certificado, competencia: string, pastaBase: string): Promise<string> {
  const filePath = getRetencoesPath(pastaBase, certificado.cnpj, certificado.razao_social, competencia, 'pdf')
  ensureDir(filePath)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('Relatório de Retenções', { align: 'center' })
    doc.fontSize(10).font('Helvetica').text(`${certificado.razao_social} - CNPJ: ${certificado.cnpj}`, { align: 'center' })
    doc.text(`Competência: ${competencia}`, { align: 'center' })
    doc.moveDown()

    // Table header
    const headers = ['Número', 'Data', 'Prestador', 'Tomador', 'ISS', 'INSS', 'IRRF', 'PIS', 'COFINS', 'CSLL', 'Total']
    const colWidths = [50, 65, 120, 120, 50, 50, 50, 50, 50, 50, 60]
    let y = doc.y
    let x = 40

    doc.fontSize(7).font('Helvetica-Bold')
    headers.forEach((h, i) => {
      doc.text(h, x, y, { width: colWidths[i], align: 'center' })
      x += colWidths[i]
    })
    y += 15

    // Table rows
    doc.font('Helvetica').fontSize(7)
    for (const row of dados) {
      x = 40
      const values = [
        row.numero_nota,
        row.data_emissao ? new Date(row.data_emissao).toLocaleDateString('pt-BR') : '—',
        row.nome_prestador || '—',
        row.nome_tomador || '—',
        row.iss.toFixed(2),
        row.inss.toFixed(2),
        row.irrf.toFixed(2),
        row.pis.toFixed(2),
        row.cofins.toFixed(2),
        row.csll.toFixed(2),
        row.total_retido.toFixed(2)
      ]
      values.forEach((v, i) => {
        doc.text(String(v), x, y, { width: colWidths[i], align: i >= 4 ? 'right' : 'left' })
        x += colWidths[i]
      })
      y += 12

      if (y > 550) {
        doc.addPage()
        y = 40
      }
    }

    // Totals
    doc.moveDown()
    doc.font('Helvetica-Bold').fontSize(8)
    const totals = dados.reduce(
      (acc, r) => ({
        iss: acc.iss + r.iss,
        inss: acc.inss + r.inss,
        irrf: acc.irrf + r.irrf,
        pis: acc.pis + r.pis,
        cofins: acc.cofins + r.cofins,
        csll: acc.csll + r.csll,
        total: acc.total + r.total_retido
      }),
      { iss: 0, inss: 0, irrf: 0, pis: 0, cofins: 0, csll: 0, total: 0 }
    )

    x = 40
    doc.text('TOTAL', x, y, { width: 355, align: 'right' })
    x = 395
    const totalValues = [totals.iss, totals.inss, totals.irrf, totals.pis, totals.cofins, totals.csll, totals.total]
    totalValues.forEach((v, i) => {
      doc.text(v.toFixed(2), x, y, { width: colWidths[i + 4], align: 'right' })
      x += colWidths[i + 4]
    })

    doc.end()
    stream.on('finish', () => resolve(filePath))
    stream.on('error', reject)
  })
}

// REQ-062: XLSX generation
async function gerarXlsx(dados: RetencaoRow[], certificado: Certificado, competencia: string, pastaBase: string): Promise<string> {
  const filePath = getRetencoesPath(pastaBase, certificado.cnpj, certificado.razao_social, competencia, 'xlsx')
  ensureDir(filePath)

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Retenções')

  // Header row
  sheet.columns = [
    { header: 'Número', key: 'numero_nota', width: 15 },
    { header: 'Data', key: 'data_emissao', width: 15 },
    { header: 'Prestador', key: 'nome_prestador', width: 30 },
    { header: 'Tomador', key: 'nome_tomador', width: 30 },
    { header: 'ISS', key: 'iss', width: 12 },
    { header: 'INSS', key: 'inss', width: 12 },
    { header: 'IRRF', key: 'irrf', width: 12 },
    { header: 'PIS', key: 'pis', width: 12 },
    { header: 'COFINS', key: 'cofins', width: 12 },
    { header: 'CSLL', key: 'csll', width: 12 },
    { header: 'Total Retido', key: 'total_retido', width: 15 }
  ]

  // Style header
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // Data rows
  for (const row of dados) {
    sheet.addRow({
      numero_nota: row.numero_nota,
      data_emissao: row.data_emissao ? new Date(row.data_emissao).toLocaleDateString('pt-BR') : '—',
      nome_prestador: row.nome_prestador || '—',
      nome_tomador: row.nome_tomador || '—',
      iss: row.iss,
      inss: row.inss,
      irrf: row.irrf,
      pis: row.pis,
      cofins: row.cofins,
      csll: row.csll,
      total_retido: row.total_retido
    })
  }

  // Totals row with SUM formulas
  const totalRowNum = dados.length + 2
  sheet.getCell(`A${totalRowNum}`).value = 'TOTAL'
  sheet.getCell(`A${totalRowNum}`).font = { bold: true }

  const sumCols = ['E', 'F', 'G', 'H', 'I', 'J', 'K']
  sumCols.forEach((col) => {
    sheet.getCell(`${col}${totalRowNum}`).value = { formula: `SUM(${col}2:${col}${totalRowNum - 1})` }
    sheet.getCell(`${col}${totalRowNum}`).font = { bold: true }
    sheet.getCell(`${col}${totalRowNum}`).numFmt = '#,##0.00'
  })

  await workbook.xlsx.writeFile(filePath)
  return filePath
}

// Generate both reports for a certificate/competencia
export async function gerarRelatorios(certificadoId: string, competencia: string): Promise<{ pdf: string | null; xlsx: string | null }> {
  const db = getDb()

  const cert = db.prepare('SELECT * FROM certificados WHERE id = ?').get(certificadoId) as Certificado | undefined
  if (!cert) return { pdf: null, xlsx: null }

  const config = db.prepare('SELECT pasta_base FROM configuracoes WHERE id = ?').get('default') as { pasta_base: string } | undefined
  if (!config?.pasta_base) return { pdf: null, xlsx: null }

  const dados = getRetencoesByCompetencia(certificadoId, competencia)
  if (dados.length === 0) return { pdf: null, xlsx: null }

  const pdfPath = await gerarPdf(dados, cert, competencia, config.pasta_base)
  const xlsxPath = await gerarXlsx(dados, cert, competencia, config.pasta_base)

  return { pdf: pdfPath, xlsx: xlsxPath }
}

export function registerReportHandlers(): void {
  ipcMain.handle('generate-retencoes-report', async (_, certificadoId: string, competencia: string) => {
    return gerarRelatorios(certificadoId, competencia)
  })

  ipcMain.handle('report:open', async (_, filePath: string) => {
    await shell.openPath(filePath)
  })


}
