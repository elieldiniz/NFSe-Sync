import axios, { AxiosInstance } from 'axios'
import https from 'https'
import { BrowserWindow } from 'electron'

const SEFAZ_BASE_URL = 'https://adn.nfse.gov.br/contribuintes/DFe'
const MAX_RETRIES = 5
const BACKOFF_BASE_MS = 2000

interface SefazResponse {
  StatusProcessamento: string
  DataHoraProcessamento: string
  LoteDFe: Array<{
    NSU: number
    ChaveAcesso: string
    TipoDocumento: string
    TipoEvento: string | null
    DataHoraGeracao: string
    ArquivoXml: string
  }> | null
  Alertas: string[]
  Erros: string[]
}

function notifyRenderer(message: string): void {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send('sync-progress', { message })
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Creates a configured Axios instance for Sefaz mTLS
function createSefazClient(agent: https.Agent): AxiosInstance {
  return axios.create({
    baseURL: SEFAZ_BASE_URL,
    httpsAgent: agent,
    timeout: 30000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

// Fetches a single NSU batch with resilience
export async function fetchLote(
  agent: https.Agent,
  nsu: number,
  cnpj: string,
  delayThrottle: number
): Promise<SefazResponse> {
  const client = createSefazClient(agent)
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const cnpjOnly = cnpj.replace(/[^0-9]/g, '')
      const response = await client.get(`/${nsu}?cnpjConsulta=${cnpjOnly}&lote=true`, {
        signal: controller.signal as any
      })
      clearTimeout(timeoutId)

      // Throttle between requests
      await delay(delayThrottle)

      return response.data as SefazResponse
    } catch (error: any) {
      clearTimeout(timeoutId)
      lastError = error

      // HTTP 429: Rate Limit
      if (error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '30', 10)
        notifyRenderer(`Sefaz limitando tráfego, aguardando ${retryAfter}s...`)
        await delay(retryAfter * 1000)
        continue
      }

      // HTTP 404: No more documents (NSU reached the end)
      if (error.response?.status === 404) {
        const body = typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data || '')
        if (body.includes('NENHUM_DOCUMENTO')) {
          return { StatusProcessamento: 'NENHUM_DOCUMENTO_LOCALIZADO', DataHoraProcessamento: new Date().toISOString(), LoteDFe: null, Alertas: [], Erros: [] }
        }
      }

      // HTTP 5xx: Exponential Backoff
      if (error.response?.status >= 500) {
        const backoffMs = BACKOFF_BASE_MS * Math.pow(2, attempt)
        notifyRenderer(`Erro ${error.response.status} da Sefaz. Tentativa ${attempt + 1}/${MAX_RETRIES}. Aguardando ${backoffMs / 1000}s...`)
        await delay(backoffMs)
        continue
      }

      // Timeout or network error: Exponential Backoff
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        const backoffMs = BACKOFF_BASE_MS * Math.pow(2, attempt)
        notifyRenderer(`Conexão com Sefaz falhou. Tentativa ${attempt + 1}/${MAX_RETRIES}. Aguardando ${backoffMs / 1000}s...`)
        await delay(backoffMs)
        continue
      }

      throw error
    }
  }

  // All retries exhausted
  throw new Error(`FALHA_CONEXAO: Sefaz inacessível após ${MAX_RETRIES} tentativas. Último erro: ${lastError?.message}`)
}

// Check if response indicates no more documents
export function isCompleted(response: SefazResponse): boolean {
  return response.StatusProcessamento === 'NENHUM_DOCUMENTO_LOCALIZADO'
}

