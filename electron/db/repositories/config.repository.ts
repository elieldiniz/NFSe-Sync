import { getDb } from '../connection'
import { Configuracao } from '../types'

export const ConfigRepository = {
  findById(id: string): Configuracao | undefined {
    return getDb()
      .prepare('SELECT * FROM configuracoes WHERE id = ?')
      .get(id) as Configuracao | undefined
  },

  upsert(id: string, pastaBase: string): void {
    getDb()
      .prepare('INSERT OR REPLACE INTO configuracoes (id, pasta_base) VALUES (?, ?)')
      .run(id, pastaBase)
  },

  updateThrottle(id: string, delayThrottle: number): void {
    getDb()
      .prepare('UPDATE configuracoes SET delay_throttle = ? WHERE id = ?')
      .run(delayThrottle, id)
  },

  updateInterval(id: string, horas: number): void {
    getDb()
      .prepare('UPDATE configuracoes SET sinc_intervalo_horas = ? WHERE id = ?')
      .run(horas, id)
  },

  count(): number {
    return (getDb()
      .prepare('SELECT COUNT(*) as count FROM configuracoes')
      .get() as { count: number }).count
  },

  getPastaBase(id: string): string | undefined {
    const result = getDb()
      .prepare('SELECT pasta_base FROM configuracoes WHERE id = ?')
      .get(id) as { pasta_base: string } | undefined
    return result?.pasta_base
  },

  getDelayThrottle(id: string): number {
    const result = getDb()
      .prepare('SELECT delay_throttle FROM configuracoes WHERE id = ?')
      .get(id) as { delay_throttle: number } | undefined
    return result?.delay_throttle || 2000
  },

  getIntervalHours(id: string): number {
    const result = getDb()
      .prepare('SELECT sinc_intervalo_horas FROM configuracoes WHERE id = ?')
      .get(id) as { sinc_intervalo_horas: number } | undefined
    return result?.sinc_intervalo_horas || 24
  }
}
