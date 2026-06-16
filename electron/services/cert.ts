import { ipcMain, dialog } from 'electron'
import https from 'https'
import fs from 'fs'
import { execFileSync } from 'child_process'
import { getDb } from '../db/connection'
import crypto from 'crypto'
import os from 'os'
import path from 'path'

interface PfxData {
  key: string
  cert: string
  validade: Date
}

const OPENSSL_FLAGS = ['-provider', 'default', '-provider', 'legacy']

function runOpenSSL(args: string[]): string {
  return execFileSync('openssl', [...args, ...OPENSSL_FLAGS], { timeout: 15000 }).toString()
}

function withTempFile<T>(content: Buffer, ext: string, fn: (tmpPath: string) => T): T {
  const tmpPath = path.join(os.tmpdir(), `nfse_${crypto.randomUUID()}${ext}`)
  try {
    fs.writeFileSync(tmpPath, content)
    return fn(tmpPath)
  } finally {
    try { fs.unlinkSync(tmpPath) } catch { /* ignore */ }
  }
}

function extractCertFromPfx(tmpPath: string, password: string): string {
  return runOpenSSL([
    'pkcs12', '-in', tmpPath, '-clcerts', '-nokeys',
    '-passin', `pass:${password}`, '-passout', 'pass:'
  ])
}

function extractKeyFromPfx(tmpPath: string, password: string): string {
  return runOpenSSL([
    'pkcs12', '-in', tmpPath, '-nocerts', '-nodes',
    '-passin', `pass:${password}`, '-passout', 'pass:'
  ])
}

export function readPfx(pfxPath: string, password: string): PfxData {
  const pfxBuffer = fs.readFileSync(pfxPath)

  return withTempFile(pfxBuffer, '.p12', (tmpPath) => {
    const key = extractKeyFromPfx(tmpPath, password)
    const certPem = extractCertFromPfx(tmpPath, password)

    const { endDate: endDateText } = extractCertInfoFromPem(certPem)
    const match = endDateText.match(/notAfter=(.+)/)
    if (!match) throw new Error('Could not extract certificate validity')
    const validade = new Date(match[1].trim())

    return { key, cert: certPem, validade }
  })
}

export function createSefazAgent(pfxPath: string, senha: string): https.Agent {
  const pfxBuffer = fs.readFileSync(pfxPath)

  return withTempFile(pfxBuffer, '.p12', (tmpPath) => {
    const agentKey = extractKeyFromPfx(tmpPath, senha)
    const agentCert = extractCertFromPfx(tmpPath, senha)

    const agent = new https.Agent({
      key: agentKey,
      cert: agentCert,
      rejectUnauthorized: true
    })

    return agent
  })
}

function extractCertInfoFromPem(certPem: string): { subject: string; endDate: string } {
  const tmpPem = path.join(os.tmpdir(), `nfse_cert_${crypto.randomUUID()}.pem`)
  try {
    fs.writeFileSync(tmpPem, certPem)
    const subject = runOpenSSL(['x509', '-in', tmpPem, '-noout', '-subject'])
    const endDate = runOpenSSL(['x509', '-in', tmpPem, '-noout', '-enddate'])
    return { subject, endDate }
  } finally {
    try { fs.unlinkSync(tmpPem) } catch { /* ignore */ }
  }
}

export function extractCertInfo(pfxPath: string, password: string): {
  cnpj: string
  razao_social: string
  validade_cert: string
} {
  const pfxBuffer = fs.readFileSync(pfxPath)

  return withTempFile(pfxBuffer, '.p12', (tmpPath) => {
    const certPem = extractCertFromPfx(tmpPath, password)

    const { subject: subjectText, endDate: endDateText } = extractCertInfoFromPem(certPem)

    // Try OID first: 2.16.840.1.113741.1.1.1
    let cnpj = subjectText.match(/2\.16\.840\.1\.113741\.1\.1\.1\s*=\s*([0-9]+)/)?.[1] || ''

    // Extract CN and CNPJ from CN field: "RAZAO SOCIAL:12345678000199"
    const cnRaw = subjectText.match(/CN\s*=\s*([^/\n]+)/i)?.[1]?.trim() || ''
    let razaoSocial = cnRaw
    if (cnRaw.includes(':')) {
      const parts = cnRaw.split(':')
      razaoSocial = parts[0].trim()
      if (!cnpj && parts[1]) cnpj = parts[1].trim()
    }

    const notAfterMatch = endDateText.match(/notAfter=(.+)/)

    return {
      cnpj,
      razao_social: razaoSocial,
      validade_cert: notAfterMatch ? new Date(notAfterMatch[1].trim()).toISOString() : ''
    }
  })
}

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
}
