export interface Certificado {
  id: string
  cnpj: string
  razao_social: string
  caminho_pfx: string
  validade_cert: string
  sinc_automatica: boolean
  ultimo_nsu: number
  ultima_sincronizacao: string | null
}

export interface CertificadoBasic {
  id: string
  cnpj: string
  razao_social: string
  validade_cert: string
}

export interface CertificadoCreate {
  cnpj: string
  razao_social: string
  caminho_pfx: string
  senha: string
  validade_cert: string
}

export interface CertificadoUpdate {
  id: string
  cnpj?: string
  razao_social?: string
  caminho_pfx?: string
  senha?: string
  sinc_automatica?: boolean
}

export interface CertInfo {
  cnpj: string
  razao_social: string
  validade_cert: string
}

export interface BatchResult {
  file: string
  success: boolean
  cnpj?: string
  razao_social?: string
  error?: string
}
