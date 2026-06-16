# Tasks: Casamento do Design System (NFSe Sync Desktop - Fase 4)

## Setup de Frameworks (Seção 2.2)
- `[x]` Instalar `tailwindcss`, `postcss`, `autoprefixer` e configurar no Vite.
- `[x]` Instalar ícones Tabler (mesmo utilizado no `prototype.html`): `@tabler/icons-react`.
- `[x]` Adicionar fonte `Inter` do Google Fonts no `index.html`.

## Tokens de Design (Seção 9.2)
- `[x]` No `tailwind.config.js`, criar extensão `extend.colors`:
  - `blue: { DEFAULT: '#2563EB', light: '#EFF6FF', mid: '#DBEAFE' }`
  - `green: { DEFAULT: '#10B981', light: '#D1FAE5' }`
  - `red: { DEFAULT: '#EF4444', light: '#FEE2E2' }`
  - `amber: { DEFAULT: '#F59E0B', light: '#FEF3C7' }`
- `[x]` Forçar `borderRadius: { DEFAULT: '12px', md: '8px', lg: '12px' }`.
- `[x]` Configurar `boxShadow: { DEFAULT: '0 1px 3px rgba(0,0,0,0.08)' }`.

## Layout Base (Seção 9.3 A)
- `[x]` Criar `Sidebar.tsx`: transcrição exata do `<aside id="sidebar">` do `prototype.html` com largura fixa `240px`.
- `[x]` Criar `Topbar.tsx`: transcrição do `<div class="topbar">` com props `title` e `subtitle`.
- `[x]` Montar `App.tsx` com layout flex: `<Sidebar />` + `<main>` com scroll vertical.
- `[x]` Implementar navegação simples por estado: `const [page, setPage] = useState('dashboard')`.

## Dashboard (Seção 9.3 B)
- `[x]` Criar `Dashboard.tsx`.
- `[x]` Criar o grid `<div class="metric-grid">` com 4 cards: Total Certificados, Total Documentos, Total Retido R$, Última Sincronização.
- `[x]` Renderizar o botão Hero "[ Sincronizar Agora ]" centralizado (visível apenas em estado Idle).
- `[x]` Criar componente `QueuePanel.tsx` estático (dados mockados): spinner, texto de status, barra de progresso e lista de fila. Visível apenas em estado "Em Sincronização".

## Tela de Certificados (Seção 9.3 C e Seção 1.3 - Benefício Secundário)
- `[x]` Criar `CertificadosPage.tsx`.
- `[x]` Renderizar tabela com colunas: Empresa, CNPJ, Último NSU, Validade, Sinc. Automática, Ações.
- `[x]` Aplicar classe de alerta **Amarelo** `#F59E0B` em linhas cujo mock de `validade_cert` esteja dentro de 30 dias.
- `[x]` Aplicar classe de alerta **Vermelho** `#EF4444` e badge "Expirado" em linhas com certificado vencido.
- `[x]` Renderizar botão "[ + Adicionar Certificado ]" no topo direito.
- `[x]` Renderizar botão "[ Importação em Lote ]" ao lado.
- `[x]` Ações por linha: apenas ícones de Editar (`IconEdit`) e Excluir (`IconTrash`).

## Tela de Sincronizações (Seção 9.3 D)
- `[x]` Criar `SincronizacoesPage.tsx`.
- `[x]` Renderizar tabela de log com colunas: Data, Empresa, Qtd Docs, Qtd Retenções, Status.
- `[x]` Bolinha colorida para cada status: Verde (`SUCESSO`), Vermelho (`ERRO`/`FALHA_CONEXAO`), Âmbar (`EM_ANDAMENTO`).

## Tela de Configurações (Seção 9.3 D)
- `[x]` Criar `ConfiguracoesPage.tsx`.
- `[x]` Campo de Pasta Base: exibir caminho atual (mockado) e botão `[Alterar]`.
- `[x]` Toggle de "Sincronização Automática em Background".
- `[x]` Campo numérico de intervalo em horas.
- `[x]` Seção "Backup": botões "[ Exportar Backup ]" e "[ Importar Backup ]" (sem lógica ainda).

## Validação Visual
- `[x]` Abrir `prototype.html` no browser lado a lado com o app Electron.
- `[x]` Comparar pixel a pixel: cores, espaçamentos, border-radius e tipografia.

---

## Checkpoint Resultado

**Todas as tasks executadas:**

1. **Sidebar.tsx:** 240px fixo, navegação ativa com bg `#EFF6FF` e texto `#2563EB`, ícones Tabler
2. **Dashboard.tsx:** Grid 4 cards métricos + botão Hero "Sincronizar Agora"
3. **QueuePanel.tsx:** Spinner animado, barra de progresso, lista de fila com status
4. **CertificadosPage.tsx:** Tabela com badges (ok/warn/expired), toggle, ações por ícone
5. **SincronizacoesPage.tsx:** Tabela de log com bolinhas coloridas (verde/vermelho)
6. **ConfiguracoesPage.tsx:** Pasta base, intervalo, delay, botões backup
7. **HelpPage.tsx:** Cards explicativos + glossário
8. **App.tsx:** Navegação por estado com page config
9. **tailwind.config.js:** Design tokens idênticos ao prototype

**Pronto para Fase 5 (Integração)**
