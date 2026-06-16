import { app, shell, BrowserWindow, Tray, Menu, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import cron from 'node-cron'
import icon from '../../resources/icon.png?asset'
import { getDb } from '../db/connection'
import { runMigrations } from '../db/migrations/001_initial_schema'
import { registerConfigHandlers } from '../services/config'
import { registerCertHandlers } from '../services/cert'
import { registerSyncHandlers } from '../services/sync'
import { registerReportHandlers } from '../services/reports'
import { registerBackupHandlers } from '../services/backup'
import crypto from 'crypto'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let cronTask: cron.ScheduledTask | null = null
let isPaused = false

function createWindow(): void {
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

function createTray(): void {
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
      label: 'Forçar Sincronização',
      click: () => {
        triggerSyncAll()
      }
    },
    {
      label: 'Pausar Automático',
      type: 'checkbox',
      checked: false,
      click: (menuItem) => {
        isPaused = menuItem.checked
        if (cronTask) {
          if (isPaused) cronTask.stop()
          else cronTask.start()
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Abrir Pasta Raiz',
      click: () => {
        const db = getDb()
        const config = db.prepare('SELECT pasta_base FROM configuracoes WHERE id = ?').get('default') as any
        if (config?.pasta_base) shell.openPath(config.pasta_base)
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

function startCronDaemon(): void {
  const db = getDb()
  const config = db.prepare('SELECT sinc_intervalo_horas FROM configuracoes WHERE id = ?').get('default') as any
  const intervalHours = config?.sinc_intervalo_horas || 24
  const cronExpr = `0 */${intervalHours} * * *`

  cronTask = cron.schedule(cronExpr, () => {
    if (!isPaused) triggerSyncAll()
  })
}

async function triggerSyncAll(): Promise<void> {
  const db = getDb()
  const certs = db.prepare(`
    SELECT id FROM certificados
    WHERE sinc_automatica = 1 AND validade_cert >= datetime('now')
  `).all() as Array<{ id: string }>

  if (certs.length === 0) return

  mainWindow?.webContents.send('sync:progress', {
    message: `Iniciando sincronização automática de ${certs.length} empresas`
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.nfse.sync')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const db = getDb()
  runMigrations(db)

  registerConfigHandlers()
  registerCertHandlers()
  registerSyncHandlers()
  registerReportHandlers()
  registerBackupHandlers()

  // Additional handlers for Phase 5

  ipcMain.handle('delete-certificate', (_, id: string) => {
    const db = getDb()
    db.transaction(() => {
      db.prepare('DELETE FROM retencoes WHERE documento_id IN (SELECT id FROM documentos WHERE certificado_id = ?)').run(id)
      db.prepare('DELETE FROM documentos WHERE certificado_id = ?').run(id)
      db.prepare('DELETE FROM sincronizacoes WHERE certificado_id = ?').run(id)
      db.prepare('DELETE FROM certificados WHERE id = ?').run(id)
    })()
  })

  ipcMain.handle('update-certificate', (_, cert: { id: string; cnpj?: string; razao_social?: string; caminho_pfx?: string; senha?: string; sinc_automatica?: boolean }) => {
    const db = getDb()
    const updates: string[] = []
    const values: any[] = []
    if (cert.cnpj !== undefined) { updates.push('cnpj = ?'); values.push(cert.cnpj) }
    if (cert.razao_social !== undefined) { updates.push('razao_social = ?'); values.push(cert.razao_social) }
    if (cert.caminho_pfx !== undefined) { updates.push('caminho_pfx = ?'); values.push(cert.caminho_pfx) }
    if (cert.senha !== undefined) { updates.push('senha_criptografada = ?'); values.push(Buffer.from(cert.senha, 'utf-8')) }
    if (cert.sinc_automatica !== undefined) { updates.push('sinc_automatica = ?'); values.push(cert.sinc_automatica ? 1 : 0) }
    if (updates.length === 0) return
    values.push(cert.id)
    db.prepare(`UPDATE certificados SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  })

  ipcMain.handle('reset-certificate', (_, id: string) => {
    const db = getDb()
    db.prepare('DELETE FROM documentos WHERE certificado_id = ?').run(id)
    db.prepare('UPDATE certificados SET ultimo_nsu = 0 WHERE id = ?').run(id)
  })

  ipcMain.handle('update-config', (_, config: { delay_throttle?: number; sinc_intervalo_horas?: number }) => {
    const db = getDb()
    if (config.delay_throttle !== undefined) {
      db.prepare('UPDATE configuracoes SET delay_throttle = ? WHERE id = ?').run(config.delay_throttle, 'default')
    }
    if (config.sinc_intervalo_horas !== undefined) {
      db.prepare('UPDATE configuracoes SET sinc_intervalo_horas = ? WHERE id = ?').run(config.sinc_intervalo_horas, 'default')
    }
  })

  ipcMain.handle('get-sync-errors', () => {
    const db = getDb()
    return db.prepare(`
      SELECT se.*, s.certificado_id, c.razao_social, c.cnpj
      FROM sync_erros se
      JOIN sincronizacoes s ON se.sincronizacao_id = s.id
      JOIN certificados c ON s.certificado_id = c.id
      ORDER BY se.created_at DESC
      LIMIT 100
    `).all()
  })

  ipcMain.handle('open-base-folder', () => {
    const db = getDb()
    const config = db.prepare('SELECT pasta_base FROM configuracoes WHERE id = ?').get('default') as any
    if (config?.pasta_base) shell.openPath(config.pasta_base)
  })

  ipcMain.handle('add-batch-certs', async (_, data: { files: string[]; senhas: string[] }) => {
    const db = getDb()
    const results: Array<{ file: string; success: boolean; cnpj?: string; razao_social?: string; error?: string }> = []
    const fs = require('fs')
    const forge = require('node-forge')

    for (const filePath of data.files) {
      let success = false
      for (const senha of data.senhas) {
        try {
          const pfxBuffer = fs.readFileSync(filePath)
          const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'))
          const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha)

          const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
          const cert = certBags[forge.pki.oids.certBag]?.[0]?.cert
          if (!cert) continue

          const subject = cert.subject
          const cn = subject.getField('CN')?.value || ''
          const cnpjField = subject.getField('2.16.840.1.113741.1.1.1')?.value || ''
          const validade = new Date(cert.validity.notAfter)

          const id = crypto.randomUUID()
          const encryptedPassword = Buffer.from(senha, 'utf-8')

          db.prepare(`
            INSERT OR IGNORE INTO certificados (id, cnpj, razao_social, caminho_pfx, senha_criptografada, validade_cert)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(id, cnpjField, cn, filePath, encryptedPassword, validade.toISOString())

          results.push({ file: filePath, success: true, cnpj: cnpjField, razao_social: cn })
          success = true
          break
        } catch {
          continue
        }
      }
      if (!success) {
        results.push({ file: filePath, success: false, error: 'Senha incorreta em todas as tentativas' })
      }
    }

    return results
  })

  createWindow()
  createTray()
  startCronDaemon()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else mainWindow?.show()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
