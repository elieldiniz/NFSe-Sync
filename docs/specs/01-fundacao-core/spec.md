# Specification: Fundação Core e Banco de Dados (NFSe Sync Desktop - Fase 1)

## Objetivo
Garantir a execução da Modelagem Relacional de Banco de Dados definida na Seção 5, os padrões de performance estritos da Seção 2.2, e o comportamento de Onboarding bloqueante do UC006.

---

# Requirements

## REQ-011: Modelagem Relacional Literal (Seção 5)
O sistema DEVE criar todas as tabelas rigorosamente conforme o esquema SQL definido no documento de arquitetura, incluindo constraints e indexes.

### Scenario: Migração Kysely (Initial Schema)
**GIVEN** que o banco de dados seja criado pela primeira vez
**WHEN** o Kysely executar a migração `001_initial_schema`
**THEN** ele deve criar a tabela `configuracoes` (campos: `id`, `pasta_base`, `delay_throttle DEFAULT 2000`, `sinc_intervalo_horas DEFAULT 24`)
**AND** criar a tabela `certificados` (com `validade_cert DATETIME NOT NULL`, `sinc_automatica BOOLEAN DEFAULT 1`, `ultimo_nsu INTEGER DEFAULT 0`)
**AND** criar a tabela `documentos` com constraint `UNIQUE(chave_documento)` e `CHECK(status IN ('ATIVA', 'CANCELADA', 'SUBSTITUIDA'))` e `CHECK(tipo IN ('EMITIDA', 'RECEBIDA', 'EVENTO'))`
**AND** criar os **3 indexes** obrigatórios: `idx_docs_competencia`, `idx_docs_tipo` e `idx_docs_status`
**AND** criar as tabelas `sincronizacoes` (com `CHECK(status IN ('EM_ANDAMENTO', 'SUCESSO', 'ERRO', 'FALHA_CONEXAO'))`), `sync_erros` e `retencoes`.

---

## REQ-012: Performance de Disco do Banco de Dados (Seção 2.2)
O sistema DEVE iniciar o banco de dados com os PRAGMAs obrigatórios.

### Scenario: Inicialização do better-sqlite3
**GIVEN** a inicialização do módulo Node.js
**WHEN** a conexão `better-sqlite3` for instanciada em `/electron/db/connection.ts`
**THEN** o sistema deve aplicar `PRAGMA journal_mode = WAL`
**AND** aplicar `PRAGMA synchronous = NORMAL`.

---

## REQ-013: Onboarding Bloqueante (UC006)
O sistema DEVE impedir o acesso ao Dashboard se nenhuma configuração base existir.

### Scenario: Primeiro acesso sem configuração
**GIVEN** que a janela do Electron abre pela primeira vez
**WHEN** o React executar `SELECT COUNT(*) FROM configuracoes`
**AND** o resultado for zero
**THEN** o Dashboard deve ser bloqueado por um componente Wizard de Onboarding
**AND** o Wizard deve exibir o Passo 1: Definir a Pasta Base via `dialog.showOpenDialog`
**AND** após confirmar a pasta, exibir o Passo 2: Cadastrar o primeiro Certificado (UC001)
**AND** somente após ambos concluídos, liberar o acesso ao Dashboard.

---

## REQ-014: Backup e Restauração Segura (RN014 / UC008)
O sistema DEVE fornecer mecanismo de exportação e importação segura do banco de dados.

### Scenario: Exportar Backup
**GIVEN** o usuário clicar em "Exportar Backup" nas Configurações
**WHEN** o IPC handler for chamado
**THEN** o Node deve abrir `dialog.showSaveDialog`
**AND** usar a **Online Backup API nativa** (`db.backup('destino.sqlite')`) que sincroniza o WAL antes de copiar, garantindo arquivo íntegro.

### Scenario: Importar Backup
**GIVEN** o usuário apontar para um arquivo `.sqlite`
**WHEN** o Node processar o import
**THEN** deve executar `PRAGMA integrity_check` no arquivo importado
**AND** se retornar `"ok"`, fechar a conexão atual (`db.close()`) e substituir o banco via `fs.renameSync` (operação atômica)
**AND** reinicializar a conexão.

---

# Constraints (Restrições)
* **Segurança**: `contextIsolation: true` obrigatório. Nenhum objeto `require('fs')` ou `require('crypto')` pode vazar para o Renderer.
* **Singleton**: A conexão do `better-sqlite3` deve ser instanciada uma única vez no processo Main.

---

# Acceptance Criteria
* [ ] Projeto compilando sem erros via `npm run dev`.
* [ ] Arquivo `database.sqlite` gerado com todos as 6 tabelas e 3 indexes.
* [ ] PRAGMAs de WAL confirmados no log de inicialização.
* [ ] Ao abrir sem banco, o Wizard de Onboarding bloqueia o Dashboard.
* [ ] `window.api.pingDb()` responde com sucesso do Main ao Renderer.
