import axios, { AxiosInstance } from 'axios'
import https from 'https'
import { delay } from '../utils/delay'

const SEFAZ_BASE_URL = 'https://adn.nfse.gov.br/contribuintes/DFe'
const MAX_RETRIES = 5
const BACKOFF_BASE_MS = 2000

export interface SefazResponse {
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

export type OnProgress = (message: string) => void

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

export async function fetchLote(
  agent: https.Agent,
  nsu: number,
  cnpj: string,
  delayThrottle: number,
  onProgress?: OnProgress
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

      await delay(delayThrottle)

      return response.data as SefazResponse
    } catch (error: any) {
      clearTimeout(timeoutId)
      lastError = error

      if (error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '30', 10)
        onProgress?.(`Sefaz limitando trafego, aguardando ${retryAfter}s...`)
        await delay(retryAfter * 1000)
        continue
      }

      if (error.response?.status === 404) {
        const body = typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data || '')
        if (body.includes('NENHUM_DOCUMENTO')) {
          return { StatusProcessamento: 'NENHUM_DOCUMENTO_LOCALIZADO', DataHoraProcessamento: new Date().toISOString(), LoteDFe: null, Alertas: [], Erros: [] }
        }
      }

      if (error.response?.status >= 500) {
        const backoffMs = BACKOFF_BASE_MS * Math.pow(2, attempt)
        onProgress?.(`Erro ${error.response.status} da Sefaz. Tentativa ${attempt + 1}/${MAX_RETRIES}. Aguardando ${backoffMs / 1000}s...`)
        await delay(backoffMs)
        continue
      }

      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        const backoffMs = BACKOFF_BASE_MS * Math.pow(2, attempt)
        onProgress?.(`Conexao com Sefaz falhou. Tentativa ${attempt + 1}/${MAX_RETRIES}. Aguardando ${backoffMs / 1000}s...`)
        await delay(backoffMs)
        continue
      }

      throw error
    }
  }

  throw new Error(`FALHA_CONEXAO: Sefaz inaccessivel apos ${MAX_RETRIES} tentativas. Ultimo erro: ${lastError?.message}`)
}

export function isCompleted(response: SefazResponse): boolean {
  return response.StatusProcessamento === 'NENHUM_DOCUMENTO_LOCALIZADO'
}
