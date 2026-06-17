export interface AppConfig {
  id: string
  pasta_base: string
  delay_throttle: number
  sinc_intervalo_horas: number
  created_at: string
}

export interface ConfigUpdate {
  delay_throttle?: number
  sinc_intervalo_horas?: number
}
