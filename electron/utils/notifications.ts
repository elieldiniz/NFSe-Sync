import { BrowserWindow } from 'electron'

export function notifyRenderer(channel: string, data: unknown): void {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send(channel, data)
  }
}
