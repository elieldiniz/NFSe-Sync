# Specification: A Fila Serial e a Orquestração (NFSe Sync Desktop - Fase 3)

## Objetivo
Implementar o Motor Central que interliga o banco (Fase 1) e o parser (Fase 2), com foco em RN001-RN003 (transações), RN006-RN008 (organização física de pastas), RN011 (logs) e RN012-RN013 (fila e disco).

---

# Requirements

## REQ-031: Transações em Lotes ACID (RN001 e RN002)
**GIVEN** um lote de documentos retornado pela Sefaz (máx 500 itens)
**WHEN** o `SyncService` processar a resposta
**THEN** agrupar em batches de 100 a 200 itens
**AND** para cada batch: abrir um `BEGIN TRANSACTION` via Kysely
**AND** inserir todos os metadados com `INSERT OR IGNORE` (RN003)
**AND** somente após o `COMMIT`: atualizar `ultimo_nsu` na tabela `certificados` com o maior NSU do lote.

---

## REQ-032: Organização Física de Pastas (RN006 a RN008)
O sistema DEVE criar a estrutura de diretórios exata descrita na Seção 6 do documento.

### Scenario: Classificação de Documento por CNPJ (RN006/RN007)
**GIVEN** um documento com `cnpj_prestador` e `cnpj_tomador` no DTO
**WHEN** o `fs_manager` for gravar o XML
**THEN** comparar o `cnpj_prestador` com o CNPJ do certificado ativo
**AND** se forem iguais, gravar em `[Pasta Base]/NFSENacional/[CNPJ] - [RazaoSocial]/[AAAA-MM]/Emitidas/NFSE_[numero]_[chave].xml`
**AND** se `cnpj_tomador` for igual ao certificado, gravar em `.../Recebidas/`
**AND** se o `TipoDocumento` for `'EVENTO'`, gravar em `.../Eventos/`.

### Scenario: XML de Documento com Retenção (RN005)
**GIVEN** um documento com `possui_retencao = true`
**WHEN** o `fs_manager` gravar o arquivo principal
**THEN** gravar também uma cópia do XML em `.../Retencoes/XML/NFSE_[numero]_[chave].xml`.

---

## REQ-033: Prevenção Anti-Duplicidade (RN003)
**GIVEN** um documento com `chave_documento` já existente no banco
**WHEN** o batch for inserido
**THEN** o Kysely usar equivalente a `INSERT OR IGNORE` descartando silenciosamente
**AND** fisicamente no disco, o `fs.writeFileSync` sobrescrever o arquivo existente (idempotência total).

---

## REQ-034: Proteção de Disco e Anti-Órfãos (RN013)
**GIVEN** a gravação em sequência de XMLs no disco para um batch
**WHEN** qualquer `fs.writeFileSync` falhar (ex: HD cheio)
**THEN** iterar sobre o array `arquivosPendentes[]` com `fs.unlinkSync()` para cada arquivo já escrito
**AND** o Kysely deve realizar o `ROLLBACK` da transação aberta.

---

## REQ-035: Log Granular de Erros no Orquestrador (RN011)
**GIVEN** um NSU específico retornar DTO de erro do parser (Fase 2)
**WHEN** o Orquestrador processar o array do lote
**THEN** inserir registro em `sync_erros` via Kysely: `{ sincronizacao_id, nsu, mensagem }`
**AND** continuar o processamento dos demais NSUs do lote.

---

## REQ-036: Processamento de Cancelamentos no Orquestrador (RN010)
**GIVEN** um DTO retornado pelo parser com `tipo: 'EVENTO'` e `chave_referenciada`
**WHEN** o Orquestrador processar o item
**THEN** executar `UPDATE documentos SET status = 'CANCELADA' WHERE chave_documento = chave_referenciada`
**AND** NÃO inserir um novo registro na tabela `documentos`.

---

## REQ-037: Fila Serial FIFO (RN012)
**GIVEN** o usuário selecionar 5 empresas para sincronizar
**WHEN** o `SyncService` iniciar
**THEN** processar um CNPJ por vez em ordem de fila (FIFO)
**AND** nunca processar dois CNPJs em paralelo
**AND** emitir via IPC o status de cada empresa: `{ status: 'processando' | 'aguardando' | 'concluido' }`.

---

## REQ-038: Daemon Automático (UC010)
**GIVEN** o Electron rodando minimizado na System Tray
**WHEN** o `node-cron` disparar no intervalo configurado em `sinc_intervalo_horas`
**THEN** executar `SELECT id FROM certificados WHERE sinc_automatica = 1 AND validade_cert >= NOW()`
**AND** montar a fila serial com os resultados
**AND** ao fim, disparar uma única `Notification` nativa do SO com o resumo.

---

# Constraints (Restrições)
* **Sincronização Serial (RN012)**: Nunca instanciar duas varreduras Sefaz em paralelo. Deadlock garantido.

---

# Acceptance Criteria
* [ ] Sincronização Mock de 2 empresas processa em sequência (não paralelo).
* [ ] Após erro de disco simulado, nenhum arquivo órfão permanece na pasta base.
* [ ] Documentos com chave duplicada não geram erro na transaction.
* [ ] XML de documento com retenção gera cópia em `.../Retencoes/XML/`.
* [ ] Cancelamento atualiza status do documento referenciado para `CANCELADA`.
