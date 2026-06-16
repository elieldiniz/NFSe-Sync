import { ipcMain, BrowserWindow } from 'electron'
import { getDb } from '../db/connection'
import crypto from 'crypto'
import { fetchLote, isCompleted } from './sefaz'
import { parseDocumento, decompressXml } from './parser'
import { createSefazAgent } from './cert'
import { gerarRelatorios } from './reports'
import {
  getDocumentPath,
  getRetencaoPath,
  getEventoPath,
  writeXmlFile,
  deleteFileIfExists
} from './fs_manager'

const BATCH_SIZE = 150

interface SyncQueueItem {
  certificadoId: string
  status: 'aguardando' | 'processando' | 'concluido' | 'erro'
}

// RN012: Serial FIFO queue
let syncQueue: SyncQueueItem[] = []
let isProcessing = false

function notifyRenderer(channel: string, data: unknown): void {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send(channel, data)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Process a single certificate sync
async function processCertificateSync(certificadoId: string): Promise<{
  status: 'SUCESSO' | 'ERRO' | 'FALHA_CONEXAO'
  documentosProcessados: number
  retencoesEncontradas: number
}> {
  const db = getDb()

  const cert = db.prepare('SELECT * FROM certificados WHERE id = ?').get(certificadoId) as any
  if (!cert) throw new Error('Certificate not found')

  const config = db.prepare('SELECT * FROM configuracoes WHERE id = ?').get('default') as any
  const pastaBase = config?.pasta_base || ''
  const delayThrottle = config?.delay_throttle || 2000

  // RN009: Create agent and nullify password immediately
  const senha = cert.senha_criptografada.toString('utf-8')
  const agent = createSefazAgent(cert.caminho_pfx, senha)
  ;(cert.senha_criptografada as any) = null

  // Create sync record
  const syncId = crypto.randomUUID()
  const nsuInicial = cert.ultimo_nsu || 0

  db.prepare(`
    INSERT INTO sincronizacoes (id, certificado_id, data_inicio, nsu_inicial, status)
    VALUES (?, ?, datetime('now'), ?, 'EM_ANDAMENTO')
  `).run(syncId, certificadoId, nsuInicial)

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
        // Process in batches
        for (let i = 0; i < response.LoteDFe.length; i += BATCH_SIZE) {
          const batch = response.LoteDFe.slice(i, i + BATCH_SIZE)

          // RN013: Track files for orphan protection
          const arquivosPendentes: string[] = []

          try {
            // RN001/RN002: Transaction batch
            const processBatch = db.transaction(() => {
              for (const item of batch) {
                try {
                  // Parse document
                  const parsed = parseDocumento(item)

                  // RN010: Handle cancellation events
                  if (parsed.tipo === 'EVENTO') {
                    if ('chave_referenciada' in parsed && parsed.chave_referenciada) {
                      db.prepare(`
                        UPDATE documentos SET status = 'CANCELADA'
                        WHERE chave_documento = ?
                      `).run(parsed.chave_referenciada)

                      // Write event XML
                      const xmlContent = decompressXml(item.ArquivoXml)
                      const eventoPath = getEventoPath(pastaBase, cert.cnpj, cert.razao_social, parsed as any)
                      writeXmlFile(eventoPath, xmlContent)
                      arquivosPendentes.push(eventoPath)
                    }
                    currentNsu = Math.max(currentNsu, item.NSU)
                    continue
                  }

                  const doc = parsed as any

                  // RN006-RN008: Write XML to organized path
                  const xmlContent = decompressXml(item.ArquivoXml)
                  const docPath = getDocumentPath(pastaBase, cert.cnpj, cert.razao_social, doc)
                  writeXmlFile(docPath, xmlContent)
                  arquivosPendentes.push(docPath)

                  // RN005: Copy to retention folder if applicable
                  if (doc.possui_retencao) {
                    const retPath = getRetencaoPath(pastaBase, cert.cnpj, cert.razao_social, doc)
                    writeXmlFile(retPath, xmlContent)
                    arquivosPendentes.push(retPath)
                    retencoesEncontradas++
                  }

                  // RN003: INSERT OR IGNORE (prevents duplicates)
                  db.prepare(`
                    INSERT OR IGNORE INTO documentos
                    (id, certificado_id, chave_documento, numero_nota, tipo, status,
                     data_emissao, competencia, cnpj_prestador, nome_prestador,
                     cnpj_tomador, nome_tomador, caminho_xml, possui_retencao, valor_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `).run(
                    crypto.randomUUID(),
                    certificadoId,
                    doc.chave_documento,
                    doc.numero_nota,
                    doc.tipo,
                    'ATIVA',
                    doc.data_emissao,
                    doc.competencia,
                    doc.cnpj_prestador,
                    doc.nome_prestador,
                    doc.cnpj_tomador,
                    doc.nome_tomador,
                    docPath,
                    doc.possui_retencao ? 1 : 0,
                    doc.valor_total
                  )

                  // Insert retention record if applicable
                  if (doc.possui_retencao && doc.retencoes) {
                    const docRecord = db.prepare(
                      'SELECT id FROM documentos WHERE chave_documento = ?'
                    ).get(doc.chave_documento) as any

                    if (docRecord) {
                      db.prepare(`
                        INSERT OR IGNORE INTO retencoes
                        (id, documento_id, iss, inss, irrf, pis, cofins, csll, total_retido)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                      `).run(
                        crypto.randomUUID(),
                        docRecord.id,
                        doc.retencoes.iss,
                        doc.retencoes.inss,
                        doc.retencoes.irrf,
                        doc.retencoes.pis,
                        doc.retencoes.cofins,
                        doc.retencoes.csll,
                        doc.retencoes.total_retido
                      )
                    }
                  }

                  currentNsu = Math.max(currentNsu, item.NSU)
                  documentosProcessados++
                } catch (err: any) {
                  // RN011: Log granular error
                  db.prepare(`
                    INSERT INTO sync_erros (id, sincronizacao_id, nsu, mensagem)
                    VALUES (?, ?, ?, ?)
                  `).run(crypto.randomUUID(), syncId, item.NSU, err.message)
                  throw err // ROLLBACK entire batch
                }
              }

              // RN001/RN002: Update NSU after successful batch
              db.prepare('UPDATE certificados SET ultimo_nsu = ? WHERE id = ?')
                .run(currentNsu, certificadoId)
            })

            processBatch()

            // Notify progress
            notifyRenderer('sync:progress', {
              certificadoId,
              syncId,
              empresa: cert.razao_social,
              nsu: currentNsu,
              documentosProcessados,
              retencoesEncontradas
            })
          } catch (batchError: any) {
            // RN013: Clean orphan files on batch failure
            arquivosPendentes.forEach(p => deleteFileIfExists(p))
            throw batchError
          }
        }
      } else {
        hasMore = false
      }
    }

    // Count retentions from database (includes both new and existing)
    retencoesEncontradas = (db.prepare(`
      SELECT COUNT(*) as count FROM retencoes r
      JOIN documentos d ON r.documento_id = d.id
      WHERE d.certificado_id = ?
    `).get(certificadoId) as { count: number }).count

    // Mark sync as success
    db.prepare(`
      UPDATE sincronizacoes
      SET status = 'SUCESSO', data_fim = datetime('now'),
          nsu_final = ?, documentos_processados = ?, retencoes_encontradas = ?
      WHERE id = ?
    `).run(currentNsu, documentosProcessados, retencoesEncontradas, syncId)

    // REQ-064: Auto-generate reports if retentions found
    if (retencoesEncontradas > 0) {
      try {
        // Get unique competencias from retentions
        const competencias = db.prepare(`
          SELECT DISTINCT d.competencia
          FROM documentos d
          WHERE d.certificado_id = ? AND d.possui_retencao = 1 AND d.competencia IS NOT NULL
        `).all(certificadoId) as Array<{ competencia: string }>

        for (const comp of competencias) {
          await gerarRelatorios(certificadoId, comp.competencia)
        }
      } catch {
        // Report generation failure shouldn't fail the sync
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

    db.prepare(`
      UPDATE sincronizacoes
      SET status = ?, data_fim = datetime('now'),
          nsu_final = ?, documentos_processados = ?,
          erro_mensagem = ?
      WHERE id = ?
    `).run(
      isConnectionFail ? 'FALHA_CONEXAO' : 'ERRO',
      currentNsu,
      documentosProcessados,
      errorMsg,
      syncId
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

// RN012: Process serial queue
async function processQueue(): Promise<void> {
  if (isProcessing) return
  isProcessing = true

  while (syncQueue.length > 0) {
    const item = syncQueue[0]
    if (item.status !== 'aguardando') {
      syncQueue.shift()
      continue
    }

    // Mark as processing
    item.status = 'processando'
    notifyRenderer('sync:queue-update', {
      id: item.certificadoId,
      status: 'processando'
    })

    try {
      await processCertificateSync(item.certificadoId)
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
  notifyRenderer('sync:queue-complete', { message: 'Sincronização concluída' })
}

export function registerSyncHandlers(): void {
  // Start sync for selected certificates
  ipcMain.handle('start-sync', async (_, certificadoIds: string[]) => {
    // RN012: Add to serial queue
    for (const id of certificadoIds) {
      syncQueue.push({ certificadoId: id, status: 'aguardando' })
      notifyRenderer('sync:queue-update', { id, status: 'aguardando' })
    }

    // Start processing if not already
    processQueue()

    return { queued: certificadoIds.length }
  })

  // Start sync for all eligible certificates
  ipcMain.handle('start-sync-all', async () => {
    const db = getDb()

    // RN012: Get eligible certificates
    const certs = db.prepare(`
      SELECT id FROM certificados
      WHERE sinc_automatica = 1
        AND validade_cert >= datetime('now')
    `).all() as Array<{ id: string }>

    if (certs.length === 0) {
      return { message: 'No eligible certificates for sync' }
    }

    // Add all to queue
    for (const cert of certs) {
      syncQueue.push({ certificadoId: cert.id, status: 'aguardando' })
      notifyRenderer('sync:queue-update', {
        id: cert.id,
        status: 'aguardando'
      })
    }

    processQueue()
    return { queued: certs.length }
  })

  // Get queue status
  ipcMain.handle('get-sync-queue', () => {
    return syncQueue
  })
}
