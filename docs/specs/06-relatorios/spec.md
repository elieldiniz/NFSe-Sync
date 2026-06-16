# Specification: Relatórios e Polimento Final (NFSe Sync Desktop - Fase 6)

## Objetivo
Implementar a geração de relatórios fiscais de retenção (PDF e XLSX) nas pastas exatas definidas na Seção 6, respeitando os filtros mandatórios de status (RN004/RN005) e consolidar o produto para o Release Candidate v2.2.

---

# Requirements

## REQ-061: Geração de Relatório PDF com Path Correto (Seção 6 e RN004/RN005)
O sistema DEVE gerar o relatório em PDF na estrutura de pastas exata.

### Scenario: Geração de PDF de Retenções
**GIVEN** o usuário solicitar o relatório de uma empresa e competência (ex: `2026-06`)
**WHEN** o `ReportService` executar a query
**THEN** obrigatoriamente filtrar `WHERE d.status = 'ATIVA'` — excluindo notas canceladas (RN010)
**AND** fazer JOIN `documentos d LEFT JOIN retencoes r ON r.documento_id = d.id`
**AND** WHERE `d.possui_retencao = 1`
**AND** gerar o PDF usando `pdfkit`
**AND** salvar o arquivo no path exato: `[Pasta Base]/NFSENacional/[CNPJ] - [RazaoSocial]/[AAAA-MM]/Retencoes/Relatorio_Retencoes_[AAAA-MM].pdf`

---

## REQ-062: Geração de Relatório XLSX com Path Correto (Seção 6 e RN004/RN005)
**GIVEN** os mesmos dados do REQ-061
**WHEN** o `ReportService` gerar o Excel
**THEN** usar `exceljs` para montar a planilha com colunas: Número da Nota, Data, Prestador, Tomador, ISS, INSS, IRRF, PIS, COFINS, CSLL, Total Retido
**AND** salvar em: `[Pasta Base]/NFSENacional/[CNPJ] - [RazaoSocial]/[AAAA-MM]/Retencoes/Relatorio_Retencoes_[AAAA-MM].xlsx`

---

## REQ-063: Notas Canceladas Excluídas dos Totalizadores (RN004/RN005 — Filtro Obrigatório)
**GIVEN** a query de relatório de retenções
**WHEN** executada
**THEN** notas com `status = 'CANCELADA'` DEVEM ser excluídas dos totais
**AND** DEVEM permanecer na tabela `retencoes` para fins de auditoria, mas fora do arquivo gerado.

---

## REQ-064: Regeneração Automática Após Sync (Seção 3.3 / RN005)
**GIVEN** a conclusão de uma sincronização que encontrou novas retenções
**WHEN** o `SyncService` finalizar o batch com `retencoes_encontradas > 0`
**THEN** o `ReportService` deve ser invocado automaticamente para regenerar os arquivos PDF e XLSX da competência afetada
**AND** sobrescrever os arquivos existentes (idempotência).

---

## REQ-065: Abertura do Arquivo Gerado
**GIVEN** a geração do relatório concluída
**WHEN** o Frontend receber o evento de conclusão
**THEN** exibir botão "[ Abrir Relatório ]" que invoca `shell.openPath(caminho_pdf)` via IPC.

---

# Constraints (Restrições)
* **Filtro Mandatório**: Qualquer query de totalização ou relatório DEVE incluir `WHERE d.status = 'ATIVA'`. Sem exceções.
* **Idempotência**: Regenerar o relatório de uma competência já processada deve sobrescrever, não duplicar.

---

# Acceptance Criteria
* [ ] PDF gerado na pasta correta da Seção 6: `.../[CNPJ]/[AAAA-MM]/Retencoes/Relatorio_Retencoes_[AAAA-MM].pdf`.
* [ ] XLSX gerado no mesmo path com `.xlsx`.
* [ ] Nota cancelada que tinha retenção NÃO aparece no total do relatório.
* [ ]  Query de relatório confirmada com `EXPLAIN QUERY PLAN` usando o `idx_docs_status`.
* [ ] Fluxo completo: PFX → Sync Mock → PDF/XLSX gerado → arquivo abre corretamente.
