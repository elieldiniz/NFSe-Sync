import { CertificadoRepository } from '../db/repositories/certificado.repository'
import { ConfigRepository } from '../db/repositories/config.repository'
import { SincronizacaoRepository } from '../db/repositories/sincronizacao.repository'
import { DocumentoRepository } from '../db/repositories/documento.repository'
import { RetencaoRepository } from '../db/repositories/retencoes.repository'
import { SyncErroRepository } from '../db/repositories/sync_erros.repository'
import { Certificado, Configuracao, SyncQueueItem, SyncResult } from '../db/types'
import { createSefazAgent } from './cert.service'
import { fetchLote, isCompleted } from './sefaz'
import { parseDocumento, decompressXml } from './parser'
import { getDocumentPath, getRetencaoPath, getEventoPath, writeXmlFile, deleteFileIfExists } from './fs_manager'
import { notifyRenderer } from '../utils/notifications'
import { isCompetenciaFechada } from '../utils/competencia'
import { ReportsService } from './reports.service'
import { getDb } from '../db/connection'
import crypto from 'crypto'

const BATCH_SIZE = 150

let syncQueue: SyncQueueItem[] = []
let isProcessing = false

export const SyncService = {
  getEligibleCertificates(): Array<{ id: string }> {
    return CertificadoRepository.findEligibleForSync()
  },

  enqueue(certificadoId: string): void {
    syncQueue.push({ certificadoId, status: 'aguardando' })
    notifyRenderer('sync:queue-update', { id: certificadoId, status: 'aguardando' })
  },

  getQueue(): SyncQueueItem[] {
    return syncQueue
  },

  async processQueue(): Promise<void> {
    if (isProcessing) return
    isProcessing = true

    while (syncQueue.length > 0) {
      const item = syncQueue[0]
      if (item.status !== 'aguardando') {
        syncQueue.shift()
        continue
      }

      item.status = 'processando'
      notifyRenderer('sync:queue-update', {
        id: item.certificadoId,
        status: 'processando'
      })

      try {
        await this.processCertificateSync(item.certificadoId)
        item.status = 'concluido'
        notifyRenderer('sync:queue-update', {
          id: item.certificadoId,
          status: 'concluido'
        })
      } catch (err: any) {
        console.error('[processQueue] Error for', item.certificadoId, ':', err.message || err)
        item.status = 'erro'
        notifyRenderer('sync:queue-update', {
          id: item.certificadoId,
          status: 'erro'
        })
      }

      syncQueue.shift()
    }

    isProcessing = false
    notifyRenderer('sync:queue-complete', { message: 'Sincronizacao concluida' })
  },

  async processCertificateSync(certificadoId: string): Promise<SyncResult> {
    const cert = CertificadoRepository.findById(certificadoId)
    if (!cert) throw new Error('Certificate not found')

    const config = ConfigRepository.findById('default')
    const pastaBase = config?.pasta_base || ''
    const delayThrottle = config?.delay_throttle || 2000

    const senha = cert.senha_criptografada.toString('utf-8')
    const agent = createSefazAgent(cert.caminho_pfx, senha)
    ;(cert.senha_criptografada as any) = null

    const syncId = crypto.randomUUID()
    const nsuInicial = cert.ultimo_nsu || 0

    SincronizacaoRepository.create(syncId, certificadoId, nsuInicial)

    let documentosProcessados = 0
    let retencoesEncontradas = 0
    let currentNsu = nsuInicial
    let hasMore = true

    try {
      while (hasMore) {
        const response = await fetchLote(agent, currentNsu, cert.cnpj, delayThrottle)

        if (isCompleted(response)) {
          hasMore = false
          break
        }

        if (response.LoteDFe && response.LoteDFe.length > 0) {
          for (let i = 0; i < response.LoteDFe.length; i += BATCH_SIZE) {
            const batch = response.LoteDFe.slice(i, i + BATCH_SIZE)
            const arquivosPendentes: string[] = []

            try {
              const processBatch = getDb().transaction(() => {
                for (const item of batch) {
                  try {
                    const parsed = parseDocumento(item)

                    if (parsed.tipo === 'EVENTO') {
                      if ('chave_referenciada' in parsed && parsed.chave_referenciada) {
                        DocumentoRepository.markCancelled(parsed.chave_referenciada)
                        const xmlContent = decompressXml(item.ArquivoXml)
                        const eventoPath = getEventoPath(pastaBase, cert.cnpj, cert.razao_social, parsed as any)
                        writeXmlFile(eventoPath, xmlContent)
                        arquivosPendentes.push(eventoPath)
                      }
                      currentNsu = Math.max(currentNsu, item.NSU)
                      continue
                    }

                    const doc = parsed as any
                    const xmlContent = decompressXml(item.ArquivoXml)
                    const docPath = getDocumentPath(pastaBase, cert.cnpj, cert.razao_social, doc)
                    writeXmlFile(docPath, xmlContent)
                    arquivosPendentes.push(docPath)

                    if (doc.possui_retencao) {
                      const retPath = getRetencaoPath(pastaBase, cert.cnpj, cert.razao_social, doc)
                      writeXmlFile(retPath, xmlContent)
                      arquivosPendentes.push(retPath)
                      retencoesEncontradas++
                    }

                    DocumentoRepository.create({
                      certificado_id: certificadoId,
                      chave_documento: doc.chave_documento,
                      numero_nota: doc.numero_nota,
                      tipo: doc.tipo,
                      status: 'ATIVA',
                      data_emissao: doc.data_emissao,
                      competencia: doc.competencia,
                      cnpj_prestador: doc.cnpj_prestador,
                      nome_prestador: doc.nome_prestador,
                      cnpj_tomador: doc.cnpj_tomador,
                      nome_tomador: doc.nome_tomador,
                      caminho_xml: docPath,
                      possui_retencao: doc.possui_retencao,
                      valor_total: doc.valor_total
                    })

                    if (doc.possui_retencao && doc.retencoes) {
                      const docRecord = DocumentoRepository.findIdByChave(doc.chave_documento)
                      if (docRecord) {
                        RetencaoRepository.create({
                          documento_id: docRecord.id,
                          iss: doc.retencoes.iss,
                          inss: doc.retencoes.inss,
                          irrf: doc.retencoes.irrf,
                          pis: doc.retencoes.pis,
                          cofins: doc.retencoes.cofins,
                          csll: doc.retencoes.csll,
                          total_retido: doc.retencoes.total_retido
                        })
                      }
                    }

                    currentNsu = Math.max(currentNsu, item.NSU)
                    documentosProcessados++
                  } catch (err: any) {
                    SyncErroRepository.create(syncId, item.NSU, err.message)
                    throw err
                  }
                }

                CertificadoRepository.updateNsu(certificadoId, currentNsu)
              })

              processBatch()

              notifyRenderer('sync:progress', {
                certificadoId,
                syncId,
                empresa: cert.razao_social,
                nsu: currentNsu,
                documentosProcessados,
                retencoesEncontradas
              })
            } catch (batchError: any) {
              arquivosPendentes.forEach(p => deleteFileIfExists(p))
              throw batchError
            }
          }
        } else {
          hasMore = false
        }
      }

      retencoesEncontradas = DocumentoRepository.countByCertificado(certificadoId)

      SincronizacaoRepository.markSuccess(syncId, currentNsu, documentosProcessados, retencoesEncontradas)

      if (retencoesEncontradas > 0) {
        try {
          const competencias = DocumentoRepository.getCompetencias(certificadoId)
          for (const comp of competencias) {
            if (isCompetenciaFechada(comp.competencia)) {
              await ReportsService.gerarRelatorios(certificadoId, comp.competencia)
            }
          }
        } catch {
        }
      }

      return {
        status: 'SUCESSO',
        documentosProcessados,
        retencoesEncontradas
      }
    } catch (error: any) {
      const isConnectionFail = error.message?.includes('FALHA_CONEXAO')
      const errorMsg = error.message || String(error)
      console.error('[sync] Error:', errorMsg)

      SincronizacaoRepository.markError(
        syncId,
        isConnectionFail ? 'FALHA_CONEXAO' : 'ERRO',
        currentNsu,
        documentosProcessados
      )

      return {
        status: isConnectionFail ? 'FALHA_CONEXAO' : 'ERRO',
        documentosProcessados,
        retencoesEncontradas
      }
    } finally {
      agent.destroy()
    }
  }
}
