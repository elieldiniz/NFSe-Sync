# Proposal: O Motor Sefaz e Resiliência (Fase 2)

## Objetivo
Implementar a camada de rede e o parser XML responsáveis pela comunicação com a Sefaz Nacional. Esta fase materializa as lógicas de resiliência (Seção 3.2), o parser do payload envelopado (Seção 3.3) e as complexas regras de extração de retenções (RN004 e RN005) do `project-nfse-desktop.md`.

---

## Motivação
A integração com o governo flutua muito. Não podemos prosseguir para o Motor de Lotes (Fase 3) sem ter certeza que o cliente HTTP sabe lidar com quedas de conexão, Rate Limits e que a extração do GZIP opera em segurança de memória (Buffer) para não travar o Electron.

---

## Escopo

### Incluído
* Leitura e extração do PFX via `node-forge` e injeção em um `https.Agent`.
* Desenvolvimento do `SefazClient` (Axios) focado no Endpoint Padrão (`/contribuintes/DFe/{ultimo_nsu}`).
* Interceptors HTTP para tratamento de Rate Limit (HTTP 429) e Timeouts/Quedas (HTTP 502, 503, 504).
* Descompressão em RAM de payloads GZIP + Base64 usando `zlib.gunzipSync`.
* Lógica de Regex bruta (RN004) para detectar `vissret` e impostos retidos.

### Fora do escopo
* Banco de dados SQLite (já implementado na Fase 1).
* Interface Gráfica / Zustand.
* Escrita dos arquivos físicos no disco (isso será feito pela Fase 3 na orquestração).

---

## Impacto (Análise Inicial)

### Backend
* Criação do módulo `/electron/services/sefaz.ts` responsável pelo cliente HTTP.
* Criação do módulo `/electron/services/parser.ts` para processamento rápido (livre de DOM).

### Banco de Dados
* Não afeta o schema nesta fase.

### Segurança
* **Vazamento de Senha (RN009)**: O objeto da chave privada será instanciado em RAM apenas no momento do `https.Agent`, sendo nulificado imediatamente após o binding.

---

## Riscos
* **Consumo de Memória (OOM)**: XMLs muito grandes da Sefaz podem estourar a RAM do Node.js se lidos todos de uma vez.
* **Mitigação**: O uso de `fast-xml-parser` em vez de parsers DOM tradicionais, aliado à regex bruta em string, mantém a curva de RAM baixa.

---

## Dependências
* Necessita da Fase 1 (Configuração IPC e Tipagem) concluída.
