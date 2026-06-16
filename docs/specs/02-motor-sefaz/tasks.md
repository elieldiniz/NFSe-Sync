# Tasks: O Motor Sefaz e Resiliência (NFSe Sync Desktop - Fase 2)

## Segurança e Certificado (RN009)
- `[x]` Instalar `node-forge`.
- `[x]` Criar `/electron/services/cert.ts`.
- `[x]` Função para ler o arquivo `.pfx` e extrair `{ key, cert, validity.notAfter }`.
- `[x]` Implementar nulificação obrigatória: `certData = null` após instanciar o `https.Agent`.

## Cliente Sefaz e Resiliência (Seção 3.2)
- `[x]` Criar `/electron/services/sefaz.ts`.
- `[x]` Instanciar `Axios` com `httpsAgent: new https.Agent({ key, cert })`.
- `[x]` Configurar `AbortController` com timeout fixo (baseado no campo `delay_throttle` de `configuracoes`).
- `[x]` Interceptor HTTP 429: capturar `error.response.headers['retry-after']`, pausar e retentar.
- `[x]` Interceptor HTTP 5xx: Backoff escalonado (2s, 4s, 8s). Após 5 falhas, retornar flag `FALHA_CONEXAO`.
- `[x]` Implementar delay obrigatório entre lotes: `await new Promise(r => setTimeout(r, delay_throttle))`.

## Condição de Parada do Loop (Seção 3.3)
- `[x]` Checar o campo `StatusProcessamento` da resposta JSON.
- `[x]` Se `=== 'NENHUM_DOCUMENTO_LOCALIZADO'`, retornar sinal de conclusão para o Orquestrador (Fase 3).

## Pipeline de Descompressão (Seção 3.3)
- `[x]` Criar `/electron/services/parser.ts`.
- `[x]` Para cada item do `LoteDFe`: `Buffer.from(item.ArquivoXml, 'base64')`.
- `[x]` Em seguida: `zlib.gunzipSync(compressed).toString('utf-8')`.

## Parser de Retenção (RN004 e RN005)
- `[x]` Instalar `fast-xml-parser`.
- `[x]` Tentar parse estrutural do XML para localizar a tag de retenção.
- `[x]` Em caso de falha, aplicar regex de fallback: `xml.toLowerCase().replace(/<[^>]+>/g, tag => tag.toLowerCase())`.
- `[x]` Buscar por variações de campo: `vissret`, `valorissretido`, `vretiss`.
- `[x]` Aplicar validação cruzada de valores: `vLiq < vServ` e flag `tpRetIssqn = 2`.

## Processamento de Cancelamentos (RN010)
- `[x]` No parser, checar se `TipoDocumento === 'EVENTO'`.
- `[x]` Se for Evento, ler a tag `<chNFSe>` do XML descomprimido.
- `[x]` Retornar DTO com `{ tipo: 'EVENTO', chave_referenciada: string }`.

## Logs Granulares de Erro (RN011)
- `[x]` Envolver o processamento de cada NSU em `try/catch`.
- `[x]` No `catch`: preparar objeto de insert para `sync_erros` com `{ sincronizacao_id, nsu, mensagem }`.
- `[x]` O NSU problemático é pulado; o orquestrador faz ROLLBACK do lote.

## Testes Automatizados (Vitest)
- `[x]` Criar `__tests__/parser.test.ts`.
- `[x]` Mockar payload Base64 GZIP da Seção 3.3 e validar retorno do DTO de retenção.
- `[x]` Mockar XML de cancelamento com `TipoDocumento = 'EVENTO'` e validar retorno com `chave_referenciada`.

---

## Checkpoint Resultado

**Todas as tasks executadas:**

1. **cert.ts:** Funções `readPfx()` e `createSefazAgent()` com nulificação imediata da chave (RN009)
2. **sefaz.ts:** Cliente Axios com mTLS, AbortController, tratamento 429 (Retry-After), backoff exponencial 2s→4s→8s, MAX_RETRIES=5, `FALHA_CONEXAO` após falhas
3. **parser.ts:** Pipeline GZIP/Base64, parse estrutural + regex fallback, extração de retenções (vRetIss, vIssRetido, vLiq<vServ), cancelamentos via chNFSe
4. **Testes:** 10/10 passando (decompressão, retenções estruturais, regex fallback, cancelamentos, documento completo)
5. **TypeScript:** `tsc --noEmit` sem erros

**Pronto para Fase 3 (Fila Serial)**
