# Tasks: A Fila Serial e a Orquestração (NFSe Sync Desktop - Fase 3)

## Organizador Físico de Arquivos (Seção 6 e RN006-RN008)
- `[x]` Criar `/electron/services/fs_manager.ts`.
- `[x]` Função que monta o path base: `[Pasta Base]/NFSENacional/[CNPJ] - [RazaoSocial]/[AAAA-MM]/`.
- `[x]` Lógica de classificação de subpasta:
  - Se `cnpj_prestador === cnpj_certificado` → `Emitidas/`
  - Se `cnpj_tomador === cnpj_certificado` → `Recebidas/`
  - Se `tipo === 'EVENTO'` → `Eventos/`
- `[x]` Criar subdiretórios recursivamente com `fs.mkdirSync({ recursive: true })`.
- `[x]` Nomear arquivo como `NFSE_[numero_nota]_[chave_documento].xml`.
- `[x]` Se documento tem `possui_retencao = true`: gravar cópia adicional em `.../Retencoes/XML/NFSE_[numero]_[chave].xml`.

## Transação Kysely em Batch (RN001, RN002, RN003)
- `[x]` Criar `/electron/services/sync.ts`.
- `[x]` Encapsular inserções em `db.transaction()`.
- `[x]` Inserir metadados de documentos usando `INSERT OR IGNORE`.
- `[x]` Após `COMMIT` bem-sucedido do batch: atualizar `ultimo_nsu` na tabela `certificados`.
- `[x]` Atualizar contadores `documentos_processados` e `retencoes_encontradas` na tabela `sincronizacoes`.

## Proteção Anti-Órfãos (RN013)
- `[x]` Inicializar `let arquivosPendentes: string[] = []` no início de cada batch.
- `[x]` Após cada `fs.writeFileSync` bem-sucedido, adicionar o path ao array.
- `[x]` No bloco `catch`: iterar `arquivosPendentes.forEach(p => fs.unlinkSync(p))`.
- `[x]` Executar `ROLLBACK` do Kysely após limpeza do disco.

## Processamento de Cancelamentos (RN010)
- `[x]` Ao receber DTO com `tipo === 'EVENTO'`:
  - Executar `UPDATE documentos SET status = 'CANCELADA' WHERE chave_documento = ?`.
  - NÃO inserir novo registro em `documentos`.

## Log de Erros por NSU (RN011)
- `[x]` Envolver o processamento de cada DTO do lote em `try/catch`.
- `[x]` No `catch`: inserir em `sync_erros` com `{ sincronizacao_id, nsu, mensagem: error.message }`.
- `[x]` Logar o NSU problemático e continuar com os próximos.

## Fila Serial FIFO (RN012)
- `[x]` Implementar fila local no `SyncService`: `queue: string[]`.
- `[x]` Loop `while (queue.length > 0)` processando `queue.shift()` um por vez.
- `[x]` Emitir `webContents.send('sync:progress', { empresa, nsu, docs })` a cada batch.
- `[x]` Emitir `webContents.send('sync:queue-update', { id, status })` ao transitar estados.

## Daemon e System Tray (UC010)
- `[x]` Instalar `node-cron`.
- `[x]` No `main.ts`, criar a ícone na System Tray com `new Tray(iconPath)`.
- `[x]` Criar menu contextual: "Forçar Sincronização", "Pausar Automático", "Abrir Pasta Raiz".
- `[x]` Query do CRON: `SELECT id FROM certificados WHERE sinc_automatica = 1 AND validade_cert >= NOW()`.
- `[x]` Ao fim do ciclo CRON, disparar `new Notification({ title, body })` com resumo agregado.

## Testes Mock
- `[x]` Criar `__tests__/sync.test.ts` com mock do `sefaz.ts`.
- `[x]` Simular falha de disco no meio do batch e validar que nenhum arquivo órfão permanece.

---

## Checkpoint Resultado

**Todas as tasks executadas:**

1. **fs_manager.ts:** Path generation para Emitidas/Recebidas/Eventos + Retencoes/XML
2. **sync.ts:** Transaction batches (BATCH_SIZE=150), INSERT OR IGNORE, anti-orphan cleanup
3. **RN010:** Cancelamentos → UPDATE status = 'CANCELADA' sem inserir novo registro
4. **RN011:** Logs granulares em sync_erros por NSU
5. **RN012:** Fila serial FIFO com status updates via IPC
6. **UC010:** System Tray + node-cron daemon + menu contextual
7. **Testes:** 16/16 passando (10 parser + 6 sync)

**Pronto para Fase 4 (Design System)**
