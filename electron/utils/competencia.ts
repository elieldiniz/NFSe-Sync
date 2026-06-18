export function isCompetenciaFechada(competencia: string): boolean {
  const now = new Date()
  const anoAtual = now.getFullYear()
  const mesAtual = now.getMonth() + 1

  const [anoComp, mesComp] = competencia.split('-').map(Number)

  if (anoComp < anoAtual) return true
  if (anoComp === anoAtual && mesComp < mesAtual) return true

  return false
}

export function formatCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split('-')
  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return `${meses[parseInt(mes) - 1]} ${ano}`
}
