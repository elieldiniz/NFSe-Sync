# Proposal: A Fila Serial e a Orquestração (NFSe Sync Desktop - Fase 3)

## Objetivo
Implementar o Motor Central (Orquestrador) do sistema, responsável por interligar o Banco de Dados Síncrono (Fase 1) com as chamadas de API do Crawler da Sefaz (Fase 2). Esta fase foca exclusivamente na RN012 (Sincronização Serial), RN001 (Transações em Lotes) e RN013 (Tratamento de Disco Cheio).

---

## Motivação
Um aplicativo Local-First sem um orquestrador bem feito pode facilmente travar o computador do usuário ou corromper dados. Como o `better-sqlite3` bloqueia o Event Loop do Node para gravar milhares de registros em microssegundos, tentar sincronizar 5 empresas de BPO ao mesmo tempo causará Deadlocks graves. É imperativo que a fila seja Serial (FIFO) e que os salvamentos no disco e no banco sejam unificados numa transação.

---

## Escopo

### Incluído
* Serviço de orquestração `SyncService` no Main Process (UC002 Backend).
* Gerenciador de Lotes e Transações via Kysely (RN001 e RN002).
* Mecanismo Anti-Órfãos em Disco para lidar com quedas de energia ou HD cheio (RN013).
* Thread de execução invisível via `node-cron` e System Tray do Sistema Operacional (UC010).

### Fora do escopo
* Barras de progresso na Interface Gráfica (Fase 5).
* Geração de relatórios (Fase 6).

---

## Impacto (Análise Inicial)

### Backend (Node.js)
A criação do `SyncService` estabelecerá o "Daemon" do sistema. Ele rodará no fundo, lendo continuamente as empresas pendentes e processando os lotes um por um, sem congelar a tela de UI.

### Banco de Dados
Impacto violento nas escritas. Uso intensivo de `BEGIN TRANSACTION` e `COMMIT`. Aplicação severa do comando `INSERT OR IGNORE` (RN003) para blindar contra chaves de NSU duplicadas enviadas pela própria Sefaz.

### Infraestrutura Local (FileSystem)
Esta fase fará a primeira gravação na `Pasta Base` definida pela Tabela de Configurações, organizando dinamicamente os XMLs no padrão `[Pasta Base]/[CNPJ]/AAAA-MM/[Tipo]`.

---

## Riscos
* **Arquivos Lixo (Órfãos)**: Gravar o XML no HD, mas a inserção no Kysely falhar (ou vice-versa), gerando inconsistência no sistema.
* **Mitigação**: O uso obrigatório do array `arquivosPendentes` com rotina reversa de `fs.unlinkSync()` na RN013.

---

## Dependências
* Requer que as tabelas do Kysely (Fase 1) estejam completas.
* Requer a API Sefaz e o Parser testados (Fase 2).
