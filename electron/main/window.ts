import { app, shell, BrowserWindow, Tray, Menu } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ConfigRepository } from '../db/repositories/config.repository'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    if (tray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export function createTray(onSyncAll: () => void, onTogglePause: (paused: boolean) => void): void {
  tray = new Tray(icon)
  tray.setToolTip('NFSe Sync Desktop')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir NFSe Sync',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Forcar Sincronizacao',
      click: () => {
        onSyncAll()
      }
    },
    {
      label: 'Pausar Automatico',
      type: 'checkbox',
      checked: false,
      click: (menuItem) => {
        onTogglePause(menuItem.checked)
      }
    },
    { type: 'separator' },
    {
      label: 'Abrir Pasta Raiz',
      click: () => {
        const pastaBase = ConfigRepository.getPastaBase('default')
        if (pastaBase) shell.openPath(pastaBase)
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        tray?.destroy()
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}
