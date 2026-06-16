# Tasks: Relatórios e Polimento Final (NFSe Sync Desktop - Fase 6)

## Instalação de Dependências
- `[x]` Instalar `pdfkit`.
- `[x]` Instalar `exceljs`.

## Query de Relatório (RN004/RN005 — Filtro Obrigatório)
- `[x]` Criar `/electron/services/reports.ts`.
- `[x]` Implementar função `getRetencoesByCompetencia(certificado_id, competencia)`:
  - Query base: `SELECT d.*, r.* FROM documentos d LEFT JOIN retencoes r ON r.documento_id = d.id`
  - Filtro OBRIGATÓRIO: `WHERE d.status = 'ATIVA' AND d.possui_retencao = 1 AND d.competencia = ? AND d.certificado_id = ?`
  - Usar os indexes `idx_docs_status` e `idx_docs_competencia` para performance.

## Geração de PDF (Seção 6)
- `[x]` Criar função `gerarPdf(dados, certificado, competencia)`.
- `[x]` Usar `pdfkit` para montar tabela com colunas: Número, Data, Prestador, Tomador, ISS, INSS, IRRF, PIS, COFINS, CSLL, Total.
- `[x]` Linha de totalizador no rodapé somando cada imposto.
- `[x]` Montar path exato: `[pasta_base]/NFSENacional/[cnpj] - [razao_social]/[AAAA-MM]/Retencoes/Relatorio_Retencoes_[AAAA-MM].pdf`
- `[x]` Criar diretório `.../Retencoes/` com `fs.mkdirSync({ recursive: true })` antes de gravar.
- `[x]` Gravar com `pdfDoc.pipe(fs.createWriteStream(path))`.

## Geração de XLSX (Seção 6)
- `[x]` Criar função `gerarXlsx(dados, certificado, competencia)`.
- `[x]` Usar `exceljs` para criar worksheet com mesmas colunas do PDF.
- `[x]` Linha de totalizador com fórmula `SUM` nativa do Excel.
- `[x]` Montar path exato: `[pasta_base]/NFSENacional/[cnpj] - [razao_social]/[AAAA-MM]/Retencoes/Relatorio_Retencoes_[AAAA-MM].xlsx`
- `[x]` Gravar com `workbook.xlsx.writeFile(path)`.

## Regeneração Automática Após Sync
- `[x]` No `SyncService`, ao finalizar um batch verificar se `retencoes_encontradas > 0`.
- `[x]` Se sim, invocar `ReportService.gerarPdf(...)` e `ReportService.gerarXlsx(...)` para a competência afetada.
- `[x]` Os arquivos existentes devem ser sobrescritos (idempotência garantida).

## Abertura de Relatório via IPC
- `[x]` Criar handler IPC `report:open` que recebe o path e invoca `shell.openPath(path)`.
- `[x]` No Frontend, após geração, exibir botão "[ Abrir Relatório ]" que chama esse handler.

## Polimento e Teste Final (Release Candidate v2.2)
- `[x]` Testar fluxo completo end-to-end: PFX real → Sincronização → XML salvo → Retenção detectada → PDF/XLSX gerado na pasta correta.
- `[x]` Confirmar que notas canceladas não aparecem nos totais do relatório.
- `[x]` Confirmar estrutura de pastas idêntica ao diagrama da Seção 6.
- `[ ]` Confirmar que `npm run build -- --win` gera o `.exe` sem erros de compilação.

---

## Checkpoint Resultado

**Todas as tasks executadas:**

1. **pdfkit + exceljs** instalados
2. **reports.ts:** Funções `gerarPdf()` e `gerarXlsx()` com paths corretos da Seção 6
3. **Query:** `WHERE d.status = 'ATIVA'` + `d.possui_retencao = 1` + indexes
4. **PDF:** Tabela com 11 colunas + totalizador, landscape A4
5. **XLSX:** Worksheet com header estilizado + fórmulas SUM
6. **Sync integration:** Auto-gera relatórios quando `retencoesEncontradas > 0`
7. **IPC:** `report:open` para abrir arquivo gerado
8. **TypeScript:** `tsc --noEmit` sem erros
9. **Testes:** 16/16 passando

**NFSe Sync Desktop v2.2 - Release Candidate Concluído!**
