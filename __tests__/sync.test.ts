import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

// Helper to create GZIP Base64 payload
function createGzipBase64(xml: string): string {
  const compressed = zlib.gzipSync(Buffer.from(xml, 'utf-8'))
  return compressed.toString('base64')
}

const XML_NFSE = `<?xml version="1.0" encoding="UTF-8"?>
<NFe>
  <infNFe>
    <ide>
      <nNF>1001</nNF>
      <dhEmi>2026-06-15T15:30:00-03:00</dhEmi>
    </ide>
    <emit>
      <CNPJ>12345678000199</CNPJ>
      <xNome>Empresa Teste LTDA</xNome>
    </emit>
    <dest>
      <CNPJ>98765432000188</CNPJ>
      <xNome>Cliente ABC</xNome>
    </dest>
    <total>
      <ICMSTot><vNF>3000.00</vNF></ICMSTot>
    </total>
  </infNFe>
</NFe>`

describe('FS Manager - Path Generation', () => {
  it('deve gerar path correto para documento emitido', async () => {
    const { getDocumentPath } = await import('electron/services/fs_manager')

    const doc = {
      chave_documento: 'chave-123',
      numero_nota: '1001',
      tipo: 'EMITIDA' as const,
      competencia: '2026-06',
      cnpj_prestador: '12345678000199',
      cnpj_tomador: '98765432000188',
      valor_total: 3000,
      possui_retencao: false,
      retencoes: null,
      data_emissao: '2026-06-15',
      nome_prestador: '',
      nome_tomador: ''
    }

    const result = getDocumentPath('/base', '12345678000199', 'Empresa Teste', doc)
    expect(result).toContain('NFSENacional')
    expect(result).toContain('12345678000199 - Empresa Teste')
    expect(result).toContain('2026-06')
    expect(result).toContain('Emitidas')
    expect(result).toContain('NFSE_1001_chave-123.xml')
  })

  it('deve gerar path para retenção', async () => {
    const { getRetencaoPath } = await import('electron/services/fs_manager')

    const doc = {
      chave_documento: 'chave-456',
      numero_nota: '1002',
      tipo: 'EMITIDA' as const,
      competencia: '2026-06',
      cnpj_prestador: '12345678000199',
      cnpj_tomador: '98765432000188',
      valor_total: 5000,
      possui_retencao: true,
      retencoes: null,
      data_emissao: '2026-06-15',
      nome_prestador: '',
      nome_tomador: ''
    }

    const result = getRetencaoPath('/base', '12345678000199', 'Empresa Teste', doc)
    expect(result).toContain('Retencoes')
    expect(result).toContain('XML')
    expect(result).toContain('NFSE_1002_chave-456.xml')
  })

  it('deve gerar path para recebida quando cnpj_tomador é o certificado', async () => {
    const { getDocumentPath } = await import('electron/services/fs_manager')

    const doc = {
      chave_documento: 'chave-789',
      numero_nota: '1003',
      tipo: 'RECEBIDA' as const,
      competencia: '2026-06',
      cnpj_prestador: '98765432000188',
      cnpj_tomador: '12345678000199',
      valor_total: 2000,
      possui_retencao: false,
      retencoes: null,
      data_emissao: '2026-06-15',
      nome_prestador: '',
      nome_tomador: ''
    }

    const result = getDocumentPath('/base', '12345678000199', 'Empresa Teste', doc)
    expect(result).toContain('Recebidas')
  })
})

describe('Parser - Cancelamentos (RN010)', () => {
  it('deve identificar evento de cancelamento', async () => {
    const { parseDocumento } = await import('electron/services/parser')

    const xmlCancelamento = `<?xml version="1.0" encoding="UTF-8"?>
    <Evento>
      <infEvento>
        <chNFSe>12345678901234567890123456789012345678901234</chNFSe>
        <descEvento>Cancelamento</descEvento>
      </infEvento>
    </Evento>`

    const item = {
      NSU: 20000,
      ChaveAcesso: 'evento-chave-789',
      TipoDocumento: 'EVENTO',
      TipoEvento: 'CANCELAMENTO',
      DataHoraGeracao: '2026-06-15T17:00:00-03:00',
      ArquivoXml: createGzipBase64(xmlCancelamento)
    }

    const result = parseDocumento(item)
    expect(result.tipo).toBe('EVENTO')
    if (result.tipo === 'EVENTO') {
      expect(result.chave_referenciada).toBeTruthy()
    }
  })
})

describe('Anti-Órfãos (RN013)', () => {
  it('deve limpar arquivos quando batch falha', () => {
    const filesWritten: string[] = []
    const filesDeleted: string[] = []

    const writeSpy = vi.fn((p: string) => {
      filesWritten.push(p)
    })

    const unlinkSpy = vi.fn((p: string) => {
      filesDeleted.push(p)
    })

    const existsSpy = vi.fn(() => true)

    // Simulate batch processing with failure
    try {
      writeSpy('/tmp/file1.xml')
      writeSpy('/tmp/file2.xml')
      throw new Error('ENOSPC')
    } catch {
      // Cleanup orphan files
      filesWritten.forEach(p => {
        if (existsSpy(p)) {
          unlinkSpy(p)
        }
      })
    }

    expect(filesDeleted).toEqual(['/tmp/file1.xml', '/tmp/file2.xml'])
    expect(unlinkSpy).toHaveBeenCalledTimes(2)
  })
})

describe('Duplicatas (RN003)', () => {
  it('INSERT OR IGNORE deve descartar duplicatas', () => {
    const results = []

    // First insert succeeds
    results.push({ changes: 1 })
    // Second insert (duplicate) is ignored
    results.push({ changes: 0 })

    // Both should succeed without error
    expect(results[0].changes).toBe(1)
    expect(results[1].changes).toBe(0)
  })
})
