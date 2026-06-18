import { ipcMain, dialog } from 'electron'
import { CertificadoRepository } from '../../db/repositories/certificado.repository'
import { CertificateUpdate, CertificateSave, BatchCertData, BatchCertResult } from '../../db/types'
import { extractCertInfo } from '../../services/cert.service'
import crypto from 'crypto'
import fs from 'fs'
import forge from 'node-forge'

export function registerCertHandlers(): void {
  ipcMain.handle('select-pfx-file', async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'Certificate', extensions: ['pfx', 'p12'] }],
      properties: ['openFile']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle('extract-cert-info', async (_, pfxPath: string, password: string) => {
    try {
      return extractCertInfo(pfxPath, password)
    } catch (err: any) {
      const stderr = err.stderr?.toString() || ''
      const stdout = err.stdout?.toString() || ''
      console.error('[extract-cert-info] Error:', err.message)
      if (stderr) console.error('[extract-cert-info] stderr:', stderr)
      if (stdout) console.error('[extract-cert-info] stdout:', stdout)
      return { error: stderr || err.message || 'Falha ao ler certificado. Verifique a senha.' }
    }
  })

  ipcMain.handle('save-certificate', (_, cert: CertificateSave) => {
    return CertificadoRepository.create(cert)
  })

  ipcMain.handle('delete-certificate', (_, id: string) => {
    CertificadoRepository.delete(id)
  })

  ipcMain.handle('update-certificate', (_, cert: CertificateUpdate) => {
    CertificadoRepository.update(cert)
  })

  ipcMain.handle('reset-certificate', (_, id: string) => {
    CertificadoRepository.reset(id)
  })

  ipcMain.handle('add-batch-certs', async (_, data: BatchCertData) => {
    const results: BatchCertResult[] = []

    for (const filePath of data.files) {
      let success = false
      for (const senha of data.senhas) {
        try {
          const pfxBuffer = fs.readFileSync(filePath)
          const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'))
          const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha)

          const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
          const cert = certBags[forge.pki.oids.certBag]?.[0]?.cert
          if (!cert) continue

          const subject = cert.subject
          const cn = subject.getField('CN')?.value || ''
          const cnpjField = subject.getField('2.16.840.1.113741.1.1.1')?.value || ''
          const validade = new Date(cert.validity.notAfter)

          const id = crypto.randomUUID()
          CertificadoRepository.createBatch(id, cnpjField, cn, filePath, senha, validade.toISOString())

          results.push({ file: filePath, success: true, cnpj: cnpjField, razao_social: cn })
          success = true
          break
        } catch {
          continue
        }
      }
      if (!success) {
        results.push({ file: filePath, success: false, error: 'Senha incorreta em todas as tentativas' })
      }
    }

    return results
  })
}
