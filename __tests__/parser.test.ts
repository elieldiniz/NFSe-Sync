import { describe, it, expect } from 'vitest'
import zlib from 'zlib'
import {
  decompressXml,
  parseRetencoes,
  parseDocumento,
  isCancelamentoEvent,
  extractChaveReferenciada
} from '../electron/services/parser'

// Helper: Create Base64 GZIP payload from XML string
function createGzipBase64(xml: string): string {
  const compressed = zlib.gzipSync(Buffer.from(xml, 'utf-8'))
  return compressed.toString('base64')
}

// Mock XML NFSe with retentions (Structural format)
const XML_COM_RETENCAO = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfse">
  <infNFe>
    <ide>
      <nNF>12345</nNF>
      <dhEmi>2026-06-15T15:30:00-03:00</dhEmi>
    </ide>
    <emit>
      <CNPJ>12345678000199</CNPJ>
      <xNome>Empresa XYZ LTDA</xNome>
    </emit>
    <dest>
      <CNPJ>98765432000188</CNPJ>
      <xNome>Cliente ABC SA</xNome>
    </dest>
    <total>
      <ICMSTot>
        <vNF>5000.00</vNF>
      </ICMSTot>
    </total>
    <det>
      <imposto>
        <ISSQN>
          <vISSRet>150.00</vISSRet>
        </ISSQN>
        <PIS>
          <PISAliq>
            <vPIS>45.00</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <vCOFINS>207.00</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
    </det>
  </infNFe>
</NFe>`

// Mock XML NFSe without retentions
const XML_SEM_RETENCAO = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfse">
  <infNFe>
    <ide>
      <nNF>12346</nNF>
      <dhEmi>2026-06-15T16:00:00-03:00</dhEmi>
    </ide>
    <emit>
      <CNPJ>12345678000199</CNPJ>
      <xNome>Empresa XYZ LTDA</xNome>
    </emit>
    <dest>
      <CNPJ>98765432000188</CNPJ>
      <xNome>Cliente ABC SA</xNome>
    </dest>
    <total>
      <ICMSTot>
        <vNF>2000.00</vNF>
      </ICMSTot>
    </total>
  </infNFe>
</NFe>`

// Mock XML cancelamento event
const XML_CANCELAMENTO = `<?xml version="1.0" encoding="UTF-8"?>
<Evento>
  <infEvento>
    <chNFSe>12345678901234567890123456789012345678901234</chNFSe>
    <tpEvento>110110</tpEvento>
    <descEvento>Cancelamento</descEvento>
  </infEvento>
</Evento>`

describe('Parser - Decompressão', () => {
  it('deve descomprimir payload Base64 GZIP corretamente', () => {
    const payload = createGzipBase64(XML_SEM_RETENCAO)
    const result = decompressXml(payload)
    expect(result).toContain('NFe')
    expect(result).toContain('12346')
  })
})

describe('Parser - Retenções (Estrutural)', () => {
  it('deve extrair retenções do XML estrutural', () => {
    const retencoes = parseRetencoes(XML_COM_RETENCAO)
    expect(retencoes).not.toBeNull()
    expect(retencoes!.iss).toBe(150)
    expect(retencoes!.pis).toBe(45)
    expect(retencoes!.cofins).toBe(207)
    expect(retencoes!.total_retido).toBe(402)
  })

  it('deve retornar null quando não há retenções', () => {
    const retencoes = parseRetencoes(XML_SEM_RETENCAO)
    expect(retencoes).toBeNull()
  })
})

describe('Parser - Retenções (Regex Fallback)', () => {
  it('deve capturar retenções via regex quando parsing estrutural falha', () => {
    // XML malformado quebrando o parser estrutural
    const xmlQuebrado = `<NFe><infNFe>vRetIss 250.00 vPIS 80.00 vCOFINS 368.00</infNFe></NFe>`
    const retencoes = parseRetencoes(xmlQuebrado)
    expect(retencoes).not.toBeNull()
    expect(retencoes!.iss).toBe(250)
    expect(retencoes!.pis).toBe(80)
    expect(retencoes!.cofins).toBe(368)
    expect(retencoes!.total_retido).toBe(698)
  })

  it('deve detectar retenção silenciosa via vLiq < vServ', () => {
    const xmlSilencioso = `<NFe><infNFe>vServ 1000.00 vLiq 850.00</infNFe></NFe>`
    const retencoes = parseRetencoes(xmlSilencioso)
    expect(retencoes).not.toBeNull()
    expect(retencoes!.iss).toBe(150) // Diferença entre vServ e vLiq
  })
})

describe('Parser - Cancelamentos (RN010)', () => {
  it('deve identificar evento de cancelamento', () => {
    const xmlEvento = `<Evento><infEvento><descEvento>Cancelamento</descEvento></infEvento></Evento>`
    expect(isCancelamentoEvent(xmlEvento, 'EVENTO')).toBe(true)
  })

  it('deve extrair chave referenciada do cancelamento', () => {
    const chave = extractChaveReferenciada(XML_CANCELAMENTO)
    expect(chave).toBe('12345678901234567890123456789012345678901234')
  })

  it('deve retornar null quando não tem chNFSe', () => {
    const xmlSemChave = `<Evento><infEvento><descEvento>Outro</descEvento></infEvento></Evento>`
    const chave = extractChaveReferenciada(xmlSemChave)
    expect(chave).toBeNull()
  })
})

describe('Parser - Documento Completo', () => {
  it('deve parsear documento completo com retenções', () => {
    const item = {
      NSU: 15482,
      ChaveAcesso: '12345678901234567890123456789012345678901234',
      TipoDocumento: 'NFSE',
      TipoEvento: null,
      DataHoraGeracao: '2026-06-15T15:30:00-03:00',
      ArquivoXml: createGzipBase64(XML_COM_RETENCAO)
    }

    const result = parseDocumento(item)
    expect(result.tipo).not.toBe('EVENTO')
    if (result.tipo !== 'EVENTO') {
      expect(result.chave_documento).toBe(item.ChaveAcesso)
      expect(result.possui_retencao).toBe(true)
      expect(result.retencoes).not.toBeNull()
    }
  })

  it('deve retornar evento de cancelamento quando TipoDocumento é EVENTO', () => {
    const item = {
      NSU: 15483,
      ChaveAcesso: 'evento-chave-123',
      TipoDocumento: 'EVENTO',
      TipoEvento: 'CANCELAMENTO',
      DataHoraGeracao: '2026-06-15T17:00:00-03:00',
      ArquivoXml: createGzipBase64(XML_CANCELAMENTO)
    }

    const result = parseDocumento(item)
    expect(result.tipo).toBe('EVENTO')
    if (result.tipo === 'EVENTO') {
      expect(result.chave_referenciada).toBe('12345678901234567890123456789012345678901234')
    }
  })
})
