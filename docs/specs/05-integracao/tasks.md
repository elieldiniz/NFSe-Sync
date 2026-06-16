# Tasks: Integração Front ↔ Back (NFSe Sync Desktop - Fase 5)

## Setup Zustand e IPC Bridge
- `[x]` Instalar `zustand`.
- `[x]` Criar `/src/store/useSyncStore.ts` com slice: `{ isSyncing, queue, currentCompany, progress, currentNsu }`.
- `[x]` Criar `/src/store/useCertStore.ts` com slice: `{ certificados, loading }`.
- `[x]` No `preload.ts`, expor os canais IPC necessários:
  - `window.api.getCertificates()`
  - `window.api.addBatchCerts({ files, senhas })`
  - `window.api.startSync(ids: string[])`
  - `window.api.stopSync()`
  - `window.api.resetCertificado(id)`
  - `window.api.checkFirstRun()`
  - `window.api.selectBaseFolder()`
  - `window.api.backupExport()`
  - `window.api.backupImport(filepath)`
  - `window.api.openBaseFolder()`
  - `window.api.getSyncErrors()`
  - `window.api.onSyncProgress(callback)`
  - `window.api.onSyncQueueUpdate(callback)`

## Handlers no Main Process
- `[x]` Criar todos os handlers `ipcMain.handle(...)` correspondentes para cada canal acima.
- `[x]` Handler `startSync`: recebe array de IDs, monta fila no `SyncService`, inicia loop serial.
- `[x]` Handler `stopSync`: interrompe loop do `SyncService` de forma segura.

## Dashboard Vivo (UC002)
- `[x]` No `Dashboard.tsx`, escutar `window.api.onSyncProgress` e injetar no Zustand Store.
- `[x]` `QueuePanel.tsx`: substituir dados mockados por `useSyncStore()`.
- `[x]` Binding da barra: `style={{ width: \`${progress}%\` }}`.
- `[x]` Lógica de exibição condicional: `isSyncing ? <QueuePanel /> : <HeroButton />`.

## Modal de Seleção de Empresas (UC002)
- `[x]` Ao abrir modal, chamar `window.api.getCertificates()` e popular a lista.
- `[x]` Implementar filtro de busca em tempo real (filtrar em memória no React).
- `[x]` Desabilitar (`disabled`) linhas onde `validade_cert < hoje`.
- `[x]` Botão "Selecionar Todas" marcar apenas as não-expiradas.
- `[x]` Ao clicar "Iniciar": fechar modal, chamar `window.api.startSync(idsSelected)`.

## Drag & Drop de Certificados em Lote (UC011)
- `[x]` Criar `ModalCertLote.tsx`.
- `[x]` Área `<div onDrop={handleDrop} onDragOver={e => e.preventDefault()}>` capturando `e.dataTransfer.files`.
- `[x]` Extrair paths absolutos dos arquivos.
- `[x]` Input de senhas (separadas por vírgula).
- `[x]` Chamar `window.api.addBatchCerts({ files, senhas })`.
- `[x]` Renderizar tabela de resultado: linha verde (sucesso) ou vermelha (falha com motivo).

## Wizard de Onboarding Funcional (UC006)
- `[x]` No `App.tsx`, ao montar, chamar `window.api.checkFirstRun()`.
- `[x]` Se `true`: renderizar `<WizardOnboarding />` em vez do layout principal.
- `[x]` Passo 1: botão "Escolher Pasta" → `window.api.selectBaseFolder()` → exibir caminho retornado.
- `[x]` Passo 2: renderizar formulário de cadastro de certificado (PFX + senha).
- `[x]` Ao concluir: navegar para Dashboard normalmente.

## Danger Zone - Reset de NSU (UC007)
- `[x]` Na página de Edição do Certificado, criar seção "Zona de Perigo" com fundo vermelho claro.
- `[x]` Botão "Reprocessar do Zero": exibir confirmação.
- `[x]` Se confirmado: chamar `window.api.resetCertificado(id)` e recarregar lista.

## Backup Funcional na UI (UC008 / RN014)
- `[x]` Na `ConfiguracoesPage.tsx`, ligar botão "Exportar Backup" ao `window.api.backupExport()`.
- `[x]` Ligar botão "Importar Backup" ao `window.api.backupImport()` com file picker nativo.
- `[x]` Exibir feedback de sucesso/erro após operação.

## Tela de Ajuda (UC009)
- [x] `HelpPage.tsx` com conteúdo estático didático.
- [x] Seção "Como funciona": texto explicativo.
- [x] Botão "Abrir Pasta Raiz": chamar `window.api.openBaseFolder()`.
- [x] Botão "Copiar Log de Erros": chamar `window.api.getSyncErrors()`, formatar e copiar via `navigator.clipboard.writeText`.

---

## Checkpoint Resultado

**Todas as tasks executadas:**

1. **Stores Zustand:** `useSyncStore.ts` (sync state) + `useCertStore.ts` (certificates)
2. **Preload:** Todos os canais IPC expostos com tipos definidos
3. **Main Process:** Handlers para delete, reset, config, batch certs, open folder, sync errors
4. **Dashboard:** Listens to `onSyncProgress`, updates store, renders QueuePanel/Hero conditionally
5. **SyncSelectModal:** Loads certs, filters by search, disables expired, select all valid
6. **ModalCertLote:** Drag & drop, password input, batch import with results table
7. **WizardOnboarding:** Functional with folder selection + certificate registration
8. **ConfiguracoesPage:** Backup export/import with feedback, interval/delay config updates
9. **HelpPage:** Copy logs to clipboard, open base folder

**Pronto para Fase 6 (Relatórios)**
