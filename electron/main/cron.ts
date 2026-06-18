import cron from 'node-cron'
import { ConfigRepository } from '../db/repositories/config.repository'

let cronTask: cron.ScheduledTask | null = null
let isPaused = false

export function startCronDaemon(onSyncAll: () => void): void {
  const intervalHours = ConfigRepository.getIntervalHours('default')
  const cronExpr = `0 */${intervalHours} * * *`

  cronTask = cron.schedule(cronExpr, () => {
    if (!isPaused) onSyncAll()
  })
}

export function togglePause(paused: boolean): void {
  isPaused = paused
  if (cronTask) {
    if (isPaused) cronTask.stop()
    else cronTask.start()
  }
}

export function isDaemonPaused(): boolean {
  return isPaused
}
