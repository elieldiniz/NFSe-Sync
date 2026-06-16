# Specification: O Motor Sefaz e Resiliência (NFSe Sync Desktop - Fase 2)

## Objetivo
Definir o comportamento do cliente HTTP, do pipeline de descompressão de payload e dos algoritmos de extração de retenções e cancelamentos conforme Seções 3 e 4 (RN004, RN005, RN009, RN010, RN011).

---

# Requirements

## REQ-021: Tratamento de Rate Limit (Seção 3.2)
O sistema DEVE respeitar os limites da infraestrutura da Sefaz.

### Scenario: HTTP 429 - Rate Limit
**GIVEN** uma chamada GET para `https://adn.nfse.gov.br/contribuintes/DFe/{ultimo_nsu}?lote=true`
**WHEN** a API retornar status `429`
**THEN** o sistema deve ler o cabeçalho `Retry-After`
**AND** pausar a thread via `await new Promise(r => setTimeout(r, ms))`
**AND** notificar o IPC: `"Sefaz limitando tráfego, aguardando 30s..."`.

---

## REQ-022: Backoff em Quedas (Seção 3.2)
**GIVEN** uma chamada ativa para a Sefaz
**WHEN** a API retornar 502, 503, 504 ou estourar timeout do `AbortController`
**THEN** o sistema deve retentar com delays escalonados: 2s, 4s, 8s
**AND** após 5 falhas consecutivas, encerrar com status `FALHA_CONEXAO` sem corromper o NSU salvo.

---

## REQ-023: Condição de Parada do Loop NSU (Seção 3.3)
O sistema DEVE encerrar o loop de sincronização ao receber a flag de conclusão da API.

### Scenario: Fim dos Documentos
**GIVEN** o loop de requisições de lotes da Sefaz
**WHEN** o campo `StatusProcessamento` da resposta for `'NENHUM_DOCUMENTO_LOCALIZADO'`
**THEN** o `SyncService` deve sair do loop `while`
**AND** marcar a sincronização como `SUCESSO` na tabela `sincronizacoes`.

---

## REQ-024: Pipeline de Descompressão GZIP/Base64 (Seção 3.3)
**GIVEN** um item do array `LoteDFe` com o campo `ArquivoXml: "H4sIAAAAAAAA/..."`
**WHEN** o Parser processar o item
**THEN** executar obrigatoriamente `Buffer.from(ArquivoXml, 'base64')`
**AND** em seguida `zlib.gunzipSync(compressedBuffer).toString('utf-8')`
**AND** somente então passar a string XML para o algoritmo de retenção.

---

## REQ-025: Extração de Retenções com Fallback (RN004 e RN005)
**GIVEN** a string XML descomprimida
**WHEN** o `fast-xml-parser` tentar localizar a tag estrutural de retenção
**AND** falhar por má formatação do município
**THEN** aplicar a regex de normalização: `xml.toLowerCase().replace(/<[^>]+>/g, tag => tag.toLowerCase())`
**AND** buscar pelas variações: `vissret`, `valorissretido`, `vretiss`
**AND** aplicar validação cruzada: `vLiq < vServ` e flag booleana `tpRetIssqn = 2`
**AND** se confirmada retenção, marcar `possui_retencao = true` no DTO do documento.

---

## REQ-026: Processamento de Cancelamentos (RN010)
O sistema DEVE identificar eventos de cancelamento e não confundi-los com notas normais.

### Scenario: XML de Evento de Cancelamento
**GIVEN** um item do `LoteDFe` com `TipoDocumento = 'EVENTO'`
**WHEN** o parser descompactar o XML
**THEN** o parser deve ler a tag `<chNFSe>` contendo a chave da nota referenciada
**AND** retornar um DTO com `tipo: 'EVENTO'` e `chave_referenciada: string`
**AND** o Orquestrador (Fase 3) executará `UPDATE documentos SET status = 'CANCELADA' WHERE chave_documento = chave_referenciada`.

---

## REQ-027: Log Granular de Falhas de Parse (RN011)
O sistema DEVE registrar falhas individuais sem abortar o lote completo.

### Scenario: Erro de Parse num NSU Específico
**GIVEN** um XML corrompido ou inesperado num NSU específico
**WHEN** o `fast-xml-parser` ou `zlib` lançar uma exceção
**THEN** o sistema deve inserir um registro em `sync_erros` com: `sincronizacao_id`, `nsu` afetado e `mensagem` do erro
**AND** o NSU problemático deve ser pulado
**AND** o lote completo deve sofrer `ROLLBACK` para garantir integridade.

---

## REQ-028: Descarte de Senha da Memória (RN009)
**GIVEN** a senha do certificado recuperada via `safeStorage`
**WHEN** o `node-forge` a utilizar para derivar o `https.Agent`
**THEN** o objeto da chave descriptografada deve ser nulificado imediatamente: `certData = null`
**AND** nenhuma variável global deve guardar referência ao objeto.

---

# Constraints (Restrições)
* **Throttling Obrigatório**: Delay mínimo de `delay_throttle` ms (lido da tabela `configuracoes`) entre cada requisição de lote.
* **Segurança (RN009)**: Senha do PFX nunca pode existir fora do escopo imediato de derivação do `https.Agent`.

---

# Acceptance Criteria
* [ ] `https.Agent` com mTLS instanciado com sucesso.
* [ ] AbortController interrompendo requisições presas após timeout configurado.
* [ ] Interceptor 429 respeitando `Retry-After` e emitindo log para IPC.
* [ ] Teste Vitest: payload Base64 mock da Seção 3.3 retornando DTO de retenção correto.
* [ ] Teste Vitest: XML de cancelamento retornando DTO com `tipo: 'EVENTO'` e `chave_referenciada`.
