import { memo } from 'react'
import { Badge } from '@/shared/components'
import type { Certificado } from '@/types'

interface CertStatusBadgeProps {
  cert: Certificado
}

export const CertStatusBadge = memo(function CertStatusBadge({ cert }: CertStatusBadgeProps): React.JSX.Element {
  const isExpired = new Date(cert.validade_cert) < new Date()
  const daysUntilExpiry = Math.ceil(
    (new Date(cert.validade_cert).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const isWarn = !isExpired && daysUntilExpiry <= 30

  if (isExpired) return <Badge variant="err">Expirado</Badge>
  if (isWarn) return <Badge variant="warn">Vence em breve</Badge>
  return <Badge variant="ok">Ativo</Badge>
})

interface CertDateBadgeProps {
  cert: Certificado
}

export const CertDateBadge = memo(function CertDateBadge({ cert }: CertDateBadgeProps): React.JSX.Element {
  const isExpired = new Date(cert.validade_cert) < new Date()
  const daysUntilExpiry = Math.ceil(
    (new Date(cert.validade_cert).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const isWarn = !isExpired && daysUntilExpiry <= 30
  const dateStr = new Date(cert.validade_cert).toLocaleDateString('pt-BR')

  if (isExpired) return <Badge variant="err">{dateStr} · Expirado</Badge>
  if (isWarn) return <Badge variant="warn">{dateStr}</Badge>
  return <span className="text-[12px] text-gray-600 dark:text-gray-400">{dateStr}</span>
})
