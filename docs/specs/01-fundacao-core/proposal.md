# Proposal: Fundação Core e Banco de Dados (NFSe Sync Desktop - Fase 1)

## Objetivo
Estabelecer a fundação estrutural do aplicativo seguindo estritamente a **Estrutura de Pastas (Seção 8)** e implementar a **Modelagem Relacional de Banco de Dados (Seção 5)** detalhada na documentação principal (`project-nfse-desktop.md`).

---

## Motivação
A aplicação "Local-First" requer uma base de dados extremamente rápida para suportar milhares de inserções concorrentes na Fila Serial (UC002) sem travar a interface. Precisamos configurar o banco com os PRAGMAS corretos antes de avançar para a integração da Sefaz.

---

## Escopo

### Incluído
* Setup do projeto base (`electron-vite` com React e TypeScript).
* Estruturação de pastas baseada no Boilerplate definido (apenas `/electron/db/`, e `/src/`).
* Configuração do SQLite com PRAGMAs de performance exigidos na Seção 2.2 (`journal_mode = WAL`).
* Criação das 6 tabelas oficiais da Seção 5: `configuracoes`, `certificados`, `sincronizacoes`, `sync_erros`, `documentos` e `retencoes`.
* Isolamento IPC restrito (`contextIsolation: true`, `nodeIntegration: false`).

### Fora do escopo
* UI, Componentes Shadcn ou Tailwind (isso é Fase 4).
* Comunicação via rede com a API da Sefaz (isso é Fase 2).
* Lógica de parser de XML (isso é Fase 2).

---

## Impacto (Análise Inicial)

### Banco de Dados
A migração inicial injetará o esquema SQL EXATO definido na documentação principal, incluindo:
* A constraint `UNIQUE` na chave_documento para prevenir duplicações (RN003).
* Relacionamentos de chave estrangeira com `ON DELETE CASCADE` na tabela `retencoes` e `sync_erros`.
* Os campos de status `CHECK(status IN ('ATIVA', 'CANCELADA', 'SUBSTITUIDA'))`.
