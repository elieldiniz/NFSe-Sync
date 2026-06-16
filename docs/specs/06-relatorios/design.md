# Design: Relatórios e Backup (Fase 6)

## Componentes (Seção 8 e Banco)
* `/electron/services/reports.ts`: Instancia `pdfkit` e `exceljs` gravando em `/Pasta Base/CNPJ/AAAA-MM/Retencoes/`.
* `/electron/db/backup.ts`: Usa os comandos core do sqlite nativo.
