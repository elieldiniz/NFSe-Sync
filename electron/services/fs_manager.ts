import fs from 'fs'
import path from 'path'
import { DocumentoParsed, EventoCancelamento } from './parser'
import { ensureDir } from '../utils/ensure-dir'

export function getDocumentPath(
  pastaBase: string,
  cnpjCertificado: string,
  razaoSocial: string,
  doc: DocumentoParsed
): string {
  const competencia = doc.competencia
  const empresaDir = `${cnpjCertificado} - ${razaoSocial}`

  let subpasta = 'Emitidas'
  if (doc.tipo === 'EVENTO') {
    subpasta = 'Eventos'
  } else if (doc.cnpj_tomador === cnpjCertificado) {
    subpasta = 'Recebidas'
  } else if (doc.cnpj_prestador === cnpjCertificado) {
    subpasta = 'Emitidas'
  }

  const fileName = `NFSE_${doc.numero_nota}_${doc.chave_documento}.xml`
  return path.join(pastaBase, 'NFSENacional', empresaDir, competencia, subpasta, fileName)
}

export function getRetencaoPath(
  pastaBase: string,
  cnpjCertificado: string,
  razaoSocial: string,
  doc: DocumentoParsed
): string {
  const competencia = doc.competencia
  const empresaDir = `${cnpjCertificado} - ${razaoSocial}`
  const fileName = `NFSE_${doc.numero_nota}_${doc.chave_documento}.xml`
  return path.join(pastaBase, 'NFSENacional', empresaDir, competencia, 'Retencoes', 'XML', fileName)
}

export function getEventoPath(
  pastaBase: string,
  cnpjCertificado: string,
  razaoSocial: string,
  evento: EventoCancelamento
): string {
  const competencia = evento.data_geracao.substring(0, 7)
  const empresaDir = `${cnpjCertificado} - ${razaoSocial}`
  const fileName = `EVENTO_CANCELAMENTO_${evento.chave_referenciada}.xml`
  return path.join(pastaBase, 'NFSENacional', empresaDir, competencia, 'Eventos', fileName)
}

export function writeXmlFile(filePath: string, xmlContent: string): void {
  ensureDir(filePath)
  fs.writeFileSync(filePath, xmlContent, 'utf-8')
}

export function deleteFileIfExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}
