import { XMLParser } from 'fast-xml-parser'
import zlib from 'zlib'

export interface DocumentoParsed {
  chave_documento: string
  numero_nota: string
  tipo: 'EMITIDA' | 'RECEBIDA' | 'EVENTO'
  data_emissao: string
  competencia: string
  cnpj_prestador: string
  nome_prestador: string
  cnpj_tomador: string
  nome_tomador: string
  valor_total: number
  possui_retencao: boolean
  retencoes: RetencoesParsed | null
}

export interface RetencoesParsed {
  iss: number
  inss: number
  irrf: number
  pis: number
  cofins: number
  csll: number
  total_retido: number
}

export interface EventoCancelamento {
  tipo: 'EVENTO'
  chave_referenciada: string
  nsu: number
  data_geracao: string
}

// REQ-024: Pipeline de descompressão GZIP/Base64
export function decompressXml(base64Gzip: string): string {
  const compressedBuffer = Buffer.from(base64Gzip, 'base64')
  const decompressed = zlib.gunzipSync(compressedBuffer)
  return decompressed.toString('utf-8')
}

// RN010: Detect cancellation events
export function isCancelamentoEvent(xmlString: string, tipoDocumento: string): boolean {
  if (tipoDocumento !== 'EVENTO') return false
  // Check for cancellation event markers
  return xmlString.includes('cancelamento') || xmlString.includes('Cancelamento') ||
         xmlString.includes('CANCELAMENTO') || xmlString.includes('chNFSe')
}

// RN010: Extract referenced NFSe key from cancellation event
export function extractChaveReferenciada(xmlString: string): string | null {
  // Use regex first to avoid numeric conversion by XML parser
  const match = xmlString.match(/<chNFSe[^>]*>([^<]+)<\/chNFSe>/i)
  if (match) return match[1]

  // Fallback to parser with parseTagValue: false for this specific field
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false
  })
  try {
    const parsed = parser.parse(xmlString)
    const chNFSe = parsed?.NFe?.infNFe?.chNFSe ||
                   parsed?.Evento?.infEvento?.chNFSe ||
                   parsed?.retEvento?.infRetorno?.chNFSe
    if (chNFSe) return String(chNFSe)
    return null
  } catch {
    return null
  }
}

// RN004/RN005: Parse retentions with structural parser + regex fallback
export function parseRetencoes(xmlString: string): RetencoesParsed | null {
  const retencoes = parseRetencoesStructural(xmlString)
  if (retencoes && retencoes.total_retido > 0) {
    return retencoes
  }

  // Regex fallback
  const retencoesFallback = parseRetencoesRegex(xmlString)
  if (retencoesFallback && retencoesFallback.total_retido > 0) {
    return retencoesFallback
  }

  return null
}

// Structural XML parsing attempt
function parseRetencoesStructural(xmlString: string): RetencoesParsed | null {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true
  })

  try {
    const parsed = parser.parse(xmlString)

    // Navigate to retention tags - try multiple paths
    const root = parsed?.NFe?.infNFe || parsed?.infNFe || parsed?.['NFS-e'] || parsed
    const det = root?.det || []
    const detArray = Array.isArray(det) ? det : [det]

    let iss = 0, inss = 0, irrf = 0, pis = 0, cofins = 0, csll = 0

    for (const item of det) {
      const imposto = item?.imposto
      if (!imposto) continue

      // ISSQN retention
      const issqn = imposto?.ISSQN
      if (issqn) {
        iss += parseFloat(issqn.vISSRet || issqn.vISS || '0') || 0
      }

      // PIS retention
      const pisTag = imposto?.PIS
      if (pisTag?.PISAliq) {
        pis += parseFloat(pisTag.PISAliq.vPIS || '0') || 0
      }

      // COFINS retention
      const cofinsTag = imposto?.COFINS
      if (cofinsTag?.COFINSAliq) {
        cofins += parseFloat(cofinsTag.COFINSAliq.vCOFINS || '0') || 0
      }

      // IRRF retention
      const irrfTag = imposto?.II
      if (irrfTag) {
        irrf += parseFloat(irrfTag.vII || '0') || 0
      }

      // CSLL retention
      const csllTag = imposto?.CSLL
      if (csllTag?.CSLLAliq) {
        csll += parseFloat(csllTag.CSLLAliq.vCSLL || '0') || 0
      }

      // INSS retention
      const inssTag = imposto?.INSS
      if (inssTag) {
        inss += parseFloat(inssTag.vINSS || '0') || 0
      }
    }

    const total = iss + inss + irrf + pis + cofins + csll
    if (total === 0) return null

    return { iss, inss, irrf, pis, cofins, csll, total_retido: total }
  } catch {
    return null
  }
}

// RN004/RN005: Regex fallback for retention parsing
function parseRetencoesRegex(xmlString: string): RetencoesParsed | null {
  // Normalize XML for regex matching
  const normalized = xmlString.toLowerCase().replace(/<[^>]+>/g, (tag) => tag.toLowerCase())

  const patterns = {
    iss: /v(?:alor)?iss(?:retido)?[^0-9]*([0-9]+\.?[0-9]*)/,
    inss: /v(?:alor)?inss[^0-9]*([0-9]+\.?[0-9]*)/,
    irrf: /v(?:alor)?irrf[^0-9]*([0-9]+\.?[0-9]*)/,
    pis: /v(?:alor)?pis[^0-9]*([0-9]+\.?[0-9]*)/,
    cofins: /v(?:alor)?cofins[^0-9]*([0-9]+\.?[0-9]*)/,
    csll: /v(?:alor)?csll[^0-9]*([0-9]+\.?[0-9]*)/,
    vRetIss: /vretiss[^0-9]*([0-9]+\.?[0-9]*)/,
    vIssRetido: /valorissretido[^0-9]*([0-9]+\.?[0-9]*)/
  }

  const extract = (regex: RegExp): number => {
    const match = normalized.match(regex)
    return match ? parseFloat(match[1]) || 0 : 0
  }

  let iss = extract(patterns.iss) || extract(patterns.vRetIss) || extract(patterns.vIssRetido)
  const inss = extract(patterns.inss)
  const irrf = extract(patterns.irrf)
  const pis = extract(patterns.pis)
  const cofins = extract(patterns.cofins)
  const csll = extract(patterns.csll)

  // RN005: Cross-validation - check vLiq < vServ for silent retentions
  const vLiqMatch = normalized.match(/vliq[^0-9]*([0-9]+\.?[0-9]*)/)
  const vServMatch = normalized.match(/vserv[^0-9]*([0-9]+\.?[0-9]*)/)
  if (vLiqMatch && vServMatch) {
    const vLiq = parseFloat(vLiqMatch[1]) || 0
    const vServ = parseFloat(vServMatch[1]) || 0
    if (vLiq > 0 && vServ > 0 && vLiq < vServ) {
      // Potential silent retention
      const diff = vServ - vLiq
      if (iss === 0 && diff > 0) iss = diff
    }
  }

  // RN005: Check boolean flag tpRetIssqn = 2
  const tpRetMatch = normalized.match(/tpretissqn[^0-9]*([0-9]+)/)
  if (tpRetMatch && tpRetMatch[1] === '2' && iss === 0) {
    // Issued retention flag detected, try to extract value
    const issMatch = normalized.match(/iss[^0-9]*([0-9]+\.?[0-9]*)/)
    if (issMatch) iss = parseFloat(issMatch[1]) || 0
  }

  const total = iss + inss + irrf + pis + cofins + csll
  if (total === 0) return null

  return { iss, inss, irrf, pis, cofins, csll, total_retido: total }
}

// Main parser: processes a single LoteDFe item
export function parseDocumento(item: {
  NSU: number
  ChaveAcesso: string
  TipoDocumento: string
  TipoEvento: string | null
  DataHoraGeracao: string
  ArquivoXml: string
}): DocumentoParsed | EventoCancelamento {
  // REQ-024: Decompress XML
  const xmlString = decompressXml(item.ArquivoXml)

  // RN010: Check if this is a cancellation event
  if (isCancelamentoEvent(xmlString, item.TipoDocumento)) {
    const chaveReferenciada = extractChaveReferenciada(xmlString)
    return {
      tipo: 'EVENTO',
      chave_referenciada: chaveReferenciada || '',
      nsu: item.NSU,
      data_geracao: item.DataHoraGeracao
    }
  }

  // Parse standard document
  const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true })
  const parsed = parser.parse(xmlString)

  const root = parsed?.NFe?.infNFe || parsed?.infNFe || parsed?.['NFS-e'] || parsed?.infNFS || parsed

  // Extract fields with multiple path attempts
  const ide = root?.ide || root?.infNFe?.ide || root?.infNFS?.ide || {}
  const emit = root?.emit || root?.infNFe?.emit || root?.infNFS?.emit || {}
  const dest = root?.dest || root?.infNFe?.dest || root?.infNFS?.dest || {}
  const total = root?.total || root?.infNFe?.total || root?.infNFS?.total || {}

  // Determine type based on CNPJ comparison
  const cnpjEmitente = emit?.CNPJ || ''
  const cnpjTomador = dest?.CNPJ || ''

  // Parse competencia from emission date
  const dataEmissao = ide?.dhEmi || ide?.dhRecbto || item.DataHoraGeracao
  const competencia = dataEmissao ? dataEmissao.substring(0, 7) : ''

  // Parse retentions
  const retencoes = parseRetencoes(xmlString)

  // Extract valor_total from multiple possible paths (NFe and NFS-e)
  let valorTotal = 0
  if (total?.ICMSTot?.vNF) {
    valorTotal = parseFloat(total.ICMSTot.vNF) || 0
  } else if (total?.vNF) {
    valorTotal = parseFloat(total.vNF) || 0
  } else if (root?.valorServicos) {
    valorTotal = parseFloat(root.valorServicos) || 0
  } else if (root?.valorTotalServicos) {
    valorTotal = parseFloat(root.valorTotalServicos) || 0
  } else if (root?.infNFS?.valorServicos) {
    valorTotal = parseFloat(root.infNFS.valorServicos) || 0
  } else if (root?.['NFS-e']?.infNFS?.valorServicos) {
    valorTotal = parseFloat(root['NFS-e'].infNFS.valorServicos) || 0
  } else if (root?.infNFe?.total?.ICMSTot?.vNF) {
    valorTotal = parseFloat(root.infNFe.total.ICMSTot.vNF) || 0
  }

  // Debug: log the parsed structure to help identify correct path
  console.log('[parser] parsed keys:', Object.keys(parsed || {}))
  console.log('[parser] root keys:', Object.keys(root || {}))
  console.log('[parser] total keys:', Object.keys(total || {}))
  console.log('[parser] valorTotal:', valorTotal)
  if (valorTotal === 0) {
    console.log('[parser] DEBUG: full root:', JSON.stringify(root, null, 2).substring(0, 500))
  }

  return {
    chave_documento: item.ChaveAcesso,
    numero_nota: ide?.nNF || ide?.nServ || '',
    tipo: 'EMITIDA', // Default, will be determined by orchestrator
    data_emissao: dataEmissao || item.DataHoraGeracao,
    competencia,
    cnpj_prestador: cnpjEmitente,
    nome_prestador: emit?.xNome || '',
    cnpj_tomador: cnpjTomador,
    nome_tomador: dest?.xNome || '',
    valor_total: valorTotal,
    possui_retencao: !!retencoes,
    retencoes
  }
}
