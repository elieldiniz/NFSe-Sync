import https from 'https'
import fs from 'fs'
import { execFileSync } from 'child_process'
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

export function extractCertInfo(pfxPath: string, password: string): {
  cnpj: string
  razao_social: string
  validade_cert: string
} {
  const pfxBuffer = fs.readFileSync(pfxPath)

  return withTempFile(pfxBuffer, '.p12', (tmpPath) => {
    const certPem = extractCertFromPfx(tmpPath, password)

    const { subject: subjectText, endDate: endDateText } = extractCertInfoFromPem(certPem)

    let cnpj = subjectText.match(/2\.16\.840\.1\.113741\.1\.1\.1\s*=\s*([0-9]+)/)?.[1] || ''

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
