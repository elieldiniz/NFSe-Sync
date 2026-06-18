import { ipcMain, shell } from 'electron'
import { ConfigRepository } from '../../db/repositories/config.repository'

export function registerFolderHandlers(): void {
  ipcMain.handle('open-base-folder', () => {
    const pastaBase = ConfigRepository.getPastaBase('default')
    if (pastaBase) shell.openPath(pastaBase)
  })
}
