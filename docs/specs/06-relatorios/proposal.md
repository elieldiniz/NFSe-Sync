# Proposal: Relatórios e Backup (Fase 6)

## Objetivo
Implementar utilitários de fechamento contábil (PDF/Excel) de retenções e ferramentas vitais de administração (Exportar/Importar Banco de Dados UC008).

## Motivação
Entregar o valor final da ferramenta (Exportação mastigada). E proteger os dados do cliente de formatações de computador através do backup seguro SQLite.

## Escopo
* Módulo `PDFKit` formatando dados da tabela `retencoes`.
* Módulo `ExcelJS` estruturando colunas.
* IPC handlers para `db.backup()` e `PRAGMA integrity_check`.
