# Design: O Motor Sefaz e Resiliência (Fase 2)

## Arquitetura
A camada adota um design pattern estruturado com `Axios` customizado. Para prevenir inchaço do framework, o cliente HTTP será isolado em um módulo de Service no `Main Process`, que abstrairá completamente o certificado (Node-forge) e o controle de rede. O Parser não salvará dados; ele atuará como uma Função Pura, recebendo o JSON encriptado e retornando um DTO (Data Transfer Object) validado.

---

## Componentes

### Lógica de Negócio (Services/Actions)
* **`/electron/services/cert.ts`**: Lida com a API do `node-forge`. Responsável por receber o PFX em bytes e a senha (vinda da RAM temporária) e expor um objeto `{ key, cert }` legível pelo NodeJS, anulando-o imediatamente a seguir.
* **`/electron/services/sefaz.ts`**: Invólucro do `Axios`. Instancia o `https.Agent` com os dados do `cert.ts`. Implementa os `axios.interceptors.response.use` para tratar o Backoff.
* **`/electron/services/parser.ts`**: Focado estritamente na decodificação (`zlib` + `Buffer.from`) e no regex brutal descrito na RN004 (`vissret`).

---

## Fluxo Técnico
1. O Orquestrador (Fase 3) requisita o lote passando NSU: 15482 e a senha extraída temporariamente.
2. `cert.ts` abre o PFX e extrai a chave mTLS, passando pro `sefaz.ts`.
3. `sefaz.ts` dispara `GET /DFe/15482?lote=true`.
   - Se 429: Interceptor lê `Retry-After: 30`, faz um `await new Promise(r => setTimeout(r, 30000))` e retenta.
4. A requisição retorna o JSON da Sefaz.
5. O `parser.ts` recebe o campo `ArquivoXml`, decodifica o Base64, e executa o `zlib.gunzipSync`.
6. A função Pura do Parser cruza os valores (vLiq < vServ) e retorna o DTO para o orquestrador salvar no Kysely.

---

## Tradeoffs

### Escolha Principal
Optamos pelo `fast-xml-parser` e fallback explícito de Regex puro em vez de conversores DOM robustos.
*(Por que?)* No Electron, a carga de conversão DOM para strings GZIP gigantes da Sefaz estouraria rapidamente os limites de Heap do V8. Trabalhar com buffer e Regex minúsculo consome pouca memória.

### Alternativa Rejeitada
Manter o cliente HTTP no Frontend (React).
*(Por que foi descartada?)* Fazer chamadas diretas CORS no frontend web exigiria desativar o WebSecurity do Chromium. Além disso, exporia as senhas do certificado na memória não protegida da UI. O Main Process é blindado contra inspeção.

---

## ADRs Relacionadas
* Documentação base: `project-nfse-desktop.md` (Seção 3.2 e RN009).
