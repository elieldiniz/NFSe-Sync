# Tasks: Fundação Core e Banco de Dados (NFSe Sync Desktop - Fase 1)

## Estrutura Base (Seção 8)
- `[x]` Iniciar projeto via boilerplate `electron-vite` (React + TypeScript).
- `[x]` Estruturar os diretórios: `/electron/db/`, `/electron/db/migrations/`, `/electron/services/`, `/src/components/`.
- `[x]` Configurar `preload.ts` com `contextIsolation: true` e `nodeIntegration: false`.

## Banco de Dados Core (Seção 2.2)
- `[x]` Instalar: `better-sqlite3`, `kysely`, `kysely-migration`.
- `[x]` Criar `/electron/db/connection.ts` aplicando obrigatoriamente:
  - `db.pragma('journal_mode = WAL');`
  - `db.pragma('synchronous = NORMAL');`
- `[x]` Implementar o padrão Singleton para que a instância seja reutilizada em todo o Main Process.

## Migrações e Esquema (Seção 5)
- `[x]` Criar o script `001_initial_schema.ts`.
- `[x]` Tabela `configuracoes`: `id`, `pasta_base NOT NULL`, `delay_throttle DEFAULT 2000`, `sinc_intervalo_horas DEFAULT 24`.
- `[x]` Tabela `certificados`: todos os campos incluindo `validade_cert DATETIME NOT NULL`, `sinc_automatica BOOLEAN DEFAULT 1`, `ultimo_nsu DEFAULT 0`.
- `[x]` Tabela `documentos`: com `UNIQUE(chave_documento)`, `CHECK(tipo IN ('EMITIDA', 'RECEBIDA', 'EVENTO'))` e `CHECK(status IN ('ATIVA', 'CANCELADA', 'SUBSTITUIDA'))`.
- `[x]` Criar os **3 indexes obrigatórios**: `CREATE INDEX idx_docs_competencia ON documentos(competencia)`, `idx_docs_tipo` e `idx_docs_status`.
- `[x]` Tabela `sincronizacoes`: com `CHECK(status IN ('EM_ANDAMENTO', 'SUCESSO', 'ERRO', 'FALHA_CONEXAO'))`.
- `[x]` Tabela `sync_erros`: com `ON DELETE CASCADE` referenciando `sincronizacoes(id)`.
- `[x]` Tabela `retencoes`: com `UNIQUE(documento_id)` e `ON DELETE CASCADE` referenciando `documentos(id)`.

## Onboarding Bloqueante (UC006)
- `[x]` No `App.tsx`, na montagem inicial, executar `window.api.checkFirstRun()`.
- `[x]` Se retornar `true` (tabela `configuracoes` vazia), renderizar componente `<WizardOnboarding />` em vez do Dashboard.
- `[x]` Passo 1 do Wizard: Chamar `window.api.selectBaseFolder()` que invoca `dialog.showOpenDialog` no Main.
- `[x]` Passo 2 do Wizard: Abrir o Modal de Cadastro de Certificado.
- `[x]` Após conclusão de ambos, salvar na tabela `configuracoes` e liberar o Dashboard.

## Backup e Restauração (RN014 / UC008)
- `[x]` Criar handler IPC `backup:export` usando `db.backup(destPath)` da API nativa do SQLite.
- `[x]` Criar handler IPC `backup:import` que executa `PRAGMA integrity_check` antes de aceitar.
- `[x]` Em caso de banco íntegro: fechar conexão, substituir arquivo via `fs.renameSync`, e reiniciar conexão.

## Segurança IPC e Validação
- `[x]` Expor `window.api.pingDb()` no `preload.ts` e ligar ao handler no `main.ts`.
- `[x]` Confirmar que nenhum objeto `require('fs')` ou módulo Node vaza para o Renderer.

---

## Checkpoint Resultado

**Todas as tasks executadas:**

1. Projeto inicializado com `electron-vite` (React + TypeScript)
2. Estrutura de pastas conforme Seção 8:
   - `electron/db/` - Conexão SQLite + Migrações
   - `electron/services/` - cert.ts, sync.ts, reports.ts
   - `src/components/` - onboarding/, dashboard/
3. **Segurança Electron verificada:**
   - `contextIsolation: true` em `electron/main/index.ts:23`
   - `nodeIntegration: false` em `electron/main/index.ts:24`
   - Nenhum `require('fs')` ou módulo Node no `src/`
4. **Banco de Dados:**
   - Singleton pattern em `electron/db/connection.ts`
   - WAL mode + synchronous NORMAL
   - Schema idêntico à Seção 5 do documento principal
   - 3 indexes obrigatórios criados
5. **Onboarding (UC006):**
   - `check-first-run` IPC handler
   - `WizardOnboarding` com 3 steps (welcome, folder, certificate, complete)
6. **Backup (RN014):**
   - `backup:export` com `dialog.showSaveDialog`
   - `backup:import` com `PRAGMA integrity_check`
7. TypeScript passa sem erros (`tsc --noEmit`)

**Pronto para Fase 2 (Motor Sefaz)**
