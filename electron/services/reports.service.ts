import { ConfigRepository } from '../db/repositories/config.repository'
import { CertificadoRepository } from '../db/repositories/certificado.repository'
import { DocumentoRepository } from '../db/repositories/documento.repository'
import { RetencaoRow, Certificado } from '../db/types'
import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'

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

async function gerarPdf(dados: RetencaoRow[], certificado: Certificado, competencia: string, pastaBase: string): Promise<string> {
  const filePath = getRetencoesPath(pastaBase, certificado.cnpj, certificado.razao_social, competencia, 'pdf')
  ensureDir(filePath)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    doc.fontSize(16).font('Helvetica-Bold').text('Relatorio de Retencoes', { align: 'center' })
    doc.fontSize(10).font('Helvetica').text(`${certificado.razao_social} - CNPJ: ${certificado.cnpj}`, { align: 'center' })
    doc.text(`Competencia: ${competencia}`, { align: 'center' })
    doc.moveDown()

    const headers = ['#', 'Numero', 'Data', 'Prestador', 'Tomador', 'ISS', 'INSS', 'IRRF', 'PIS', 'COFINS', 'CSLL', 'Total']
    const colWidths = [25, 50, 60, 110, 110, 45, 45, 45, 45, 45, 45, 55]
    const startX = 30
    let y = doc.y
    let x = startX

    doc.fontSize(6).font('Helvetica-Bold')
    headers.forEach((h, i) => {
      const align = (i <= 2) ? 'center' : (i >= 5) ? 'right' : 'left'
      doc.text(h, x, y, { width: colWidths[i], align })
      x += colWidths[i]
    })
    y += 15

    doc.font('Helvetica').fontSize(6)
    let rowNumber = 1
    for (const row of dados) {
      x = startX
      const trunc = (str: string | null | undefined, max: number) => str && str.length > max ? str.substring(0, max - 3) + '...' : str || '-'
      const values = [
        String(rowNumber),
        trunc(row.numero_nota, 12),
        row.data_emissao ? new Date(row.data_emissao).toLocaleDateString('pt-BR') : '-',
        trunc(row.nome_prestador, 28),
        trunc(row.nome_tomador, 28),
        row.iss.toFixed(2),
        row.inss.toFixed(2),
        row.irrf.toFixed(2),
        row.pis.toFixed(2),
        row.cofins.toFixed(2),
        row.csll.toFixed(2),
        row.total_retido.toFixed(2)
      ]

      values.forEach((v, i) => {
        const align = (i <= 2) ? 'center' : (i >= 5) ? 'right' : 'left'
        doc.text(v, x, y, { width: colWidths[i], align, lineBreak: false })
        x += colWidths[i]
      })
      y += 12
      rowNumber++

      if (y > 530) {
        doc.addPage()
        y = 30
      }
    }

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

    x = startX
    doc.text('TOTAL', x, y, { width: 355, align: 'right' })
    x = 385
    const totalValues = [totals.iss, totals.inss, totals.irrf, totals.pis, totals.cofins, totals.csll, totals.total]
    totalValues.forEach((v, i) => {
      doc.text(v.toFixed(2), x, y, { width: colWidths[i + 5], align: 'right' })
      x += colWidths[i + 5]
    })

    doc.end()
    stream.on('finish', () => resolve(filePath))
    stream.on('error', reject)
  })
}

async function gerarXlsx(dados: RetencaoRow[], certificado: Certificado, competencia: string, pastaBase: string): Promise<string> {
  const filePath = getRetencoesPath(pastaBase, certificado.cnpj, certificado.razao_social, competencia, 'xlsx')
  ensureDir(filePath)

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Retencoes')

  sheet.columns = [
    { header: 'Numero', key: 'numero_nota', width: 15 },
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

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }

  for (const row of dados) {
    sheet.addRow({
      numero_nota: row.numero_nota,
      data_emissao: row.data_emissao ? new Date(row.data_emissao).toLocaleDateString('pt-BR') : '-',
      nome_prestador: row.nome_prestador || '-',
      nome_tomador: row.nome_tomador || '-',
      iss: row.iss,
      inss: row.inss,
      irrf: row.irrf,
      pis: row.pis,
      cofins: row.cofins,
      csll: row.csll,
      total_retido: row.total_retido
    })
  }

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

export const ReportsService = {
  async gerarRelatorios(certificadoId: string, competencia: string): Promise<{ pdf: string | null; xlsx: string | null }> {
    const cert = CertificadoRepository.findById(certificadoId)
    if (!cert) return { pdf: null, xlsx: null }

    const pastaBase = ConfigRepository.getPastaBase('default')
    if (!pastaBase) return { pdf: null, xlsx: null }

    const dados = DocumentoRepository.getRetencoesByCompetencia(certificadoId, competencia)
    if (dados.length === 0) return { pdf: null, xlsx: null }

    const pdfPath = await gerarPdf(dados, cert, competencia, pastaBase)
    const xlsxPath = await gerarXlsx(dados, cert, competencia, pastaBase)

    return { pdf: pdfPath, xlsx: xlsxPath }
  }
}
