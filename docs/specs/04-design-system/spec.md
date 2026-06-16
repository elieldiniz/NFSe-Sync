# Specification: Casamento do Design System (NFSe Sync Desktop - Fase 4)

## Objetivo
Converter o `prototype.html` e a Seção 9 em componentes React estáticos. Esta fase cobre TODAS as telas definidas: Dashboard, Certificados, Sincronizações e Configurações.

---

# Requirements

## REQ-041: Tokens de Design (Seção 9.2)
**GIVEN** o `tailwind.config.js` configurado
**WHEN** qualquer componente for renderizado
**THEN** `border-radius` deve ser `12px` em todos os cards, botões, inputs e modais
**AND** sombras devem ser `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` — sem gradientes 3D
**AND** tipografia padrão: `font-family: 'Inter', sans-serif`
**AND** espaçamentos apenas em múltiplos: `8px`, `16px`, `24px`, `32px`.

---

## REQ-042: Layout Base e Sidebar (Seção 9.3 A)
**GIVEN** a janela do Electron aberta
**WHEN** renderizada
**THEN** a `<Sidebar />` deve ter largura fixa de `240px`
**AND** item de menu ativo deve ter fundo `#EFF6FF` e texto `#2563EB`
**AND** os itens do menu devem ser: Dashboard, Certificados, Sincronizações, Configurações, Ajuda.

---

## REQ-043: Dashboard (Seção 9.3 B)
**GIVEN** o menu "Dashboard" ativo
**WHEN** renderizado em estado Idle
**THEN** exibir grid de 4 Cards: Total Certificados, Total Documentos, Valor Total Retido em R$, Última Sincronização
**AND** exibir o botão Hero centralizado: "[ Sincronizar Agora ]"
**WHEN** renderizado em estado "Em Sincronização"
**THEN** o botão Hero desaparece e o `<QueuePanel />` ocupa o espaço
**AND** o painel exibe: empresa atual, NSU atual, contador de documentos, barra de progresso e lista de fila.

---

## REQ-044: Tela de Certificados (Seção 9.3 C e Seção 1.3)
O sistema DEVE exibir os certificados com indicadores visuais de vencimento.

**GIVEN** o menu "Certificados" ativo
**WHEN** renderizado
**THEN** exibir tabela com colunas: Empresa, CNPJ, Último NSU, Validade, Sincronização Automática (toggle), Ações
**AND** certificados com `validade_cert` **dentro de 30 dias**: linha destacada em **Amarelo** `#F59E0B` (alerta de vencimento - Seção 1.3)
**AND** certificados com `validade_cert` **já vencida**: linha destacada em **Vermelho** `#EF4444` e badge "Expirado"
**AND** ações por linha: ícone de Editar e ícone de Excluir (sem textos gigantes)
**AND** botão "[ + Adicionar Certificado ]" no topo direito
**AND** botão "[ Importação em Lote ]" ao lado.

---

## REQ-045: Tela de Sincronizações (Seção 9.3 D)
**GIVEN** o menu "Sincronizações" ativo
**WHEN** renderizado
**THEN** exibir tabela de log com colunas: Data, Empresa, Qtd Documentos, Qtd Retenções, Status
**AND** o Status deve ter bolinha colorida: Verde (`SUCESSO`), Vermelho (`ERRO`/`FALHA_CONEXAO`), Amarelo (`EM_ANDAMENTO`).

---

## REQ-046: Tela de Configurações (Seção 9.3 D)
**GIVEN** o menu "Configurações" ativo
**WHEN** renderizado
**THEN** exibir o campo de Pasta Base com o caminho atual e botão `[Alterar]`
**AND** exibir o toggle de Sincronização Automática Global
**AND** exibir o campo de Intervalo em horas
**AND** exibir botões de Exportar Backup e Importar Backup (UC008).

---

# Constraints (Restrições)
* **Sem dados reais**: Esta fase usa apenas dados mockados estáticos. A conexão real com o banco (IPC) é implementada na Fase 5.

---

# Acceptance Criteria
* [ ] Dashboard estático idêntico ao `prototype.html` (colocar lado a lado para comparar).
* [ ] Tela de Certificados exibindo linhas em amarelo e vermelho conforme vencimento.
* [ ] Tela de Sincronizações com bolinhas coloridas de status.
* [ ] Tela de Configurações com todos os campos e botões de backup.
* [ ] Cor `#2563EB` confirmada via inspeção de elemento nos botões.
