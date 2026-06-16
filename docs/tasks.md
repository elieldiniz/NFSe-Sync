# Plano de Execução Tático: NFSe Sync Desktop

## Fase 1: Fundação Core e Banco de Dados (O Motor Base)
O objetivo aqui é botar o chassi do carro no chão, rodando com banco de dados seguro, sem interface ainda.

- [ ] **Tarefa 1.1:** Instalar Boilerplate Electron + Vite + React (TypeScript).
- [ ] **Tarefa 1.2:** Configurar better-sqlite3 com as diretrizes de performance (Modo WAL).
- [ ] **Tarefa 1.3:** Montar e rodar as Migrações Iniciais com Kysely (Tabelas: config, certificados, documentos, retencoes, logs).
- [ ] **Tarefa 1.4:** Criar a estrutura IPC básica (Ping-Pong entre Node e React).
- [ ] **Teste de Checkpoint:** Rodar um script no console que injeta um certificado "fake" no banco e ver o Kysely validar os tipos.

## Fase 2: O Motor Sefaz e Resiliência (Segurança e Parse)
Foco total na comunicação com a API Nacional e o parsing complexo de XML. Parte mais sensível do projeto.

- [ ] **Tarefa 2.1:** Implementar Serviço do node-forge (Extrair chave do PFX e limpar da memória).
- [ ] **Tarefa 2.2:** Criar o SefazClient (Injeção de certificado mTLS, interceptors para HTTP 429 Rate Limit e Exponential Backoff).
- [ ] **Tarefa 2.3:** Construir o XMLParserService usando fast-xml-parser + GZIP + Regex para detectar retenções (RN004) e ignorar lixo.
- [ ] **Teste de Checkpoint:** Usar Vitest passando um XML GZIP estático como entrada e ver a função retornar o JSON de Retenções perfeito.

## Fase 3: A Fila Serial e a Orquestração (UC002 Backend)
O cérebro do controle de NSU. É aqui que os lotes são salvos sem estourar a memória.

- [ ] **Tarefa 3.1:** Implementar a lógica de Lotes (Batches). Salvar 100 notas, commitar no banco, e escrever XMLs na pasta física em bloco.
- [ ] **Tarefa 3.2:** Implementar lógica de Limpeza de Órfãos (RN013) se der erro no disco.
- [ ] **Tarefa 3.3:** Criar a Fila Serial (Zustand -> IPC) para processar uma empresa de cada vez.
- [ ] **Tarefa 3.4:** Criar o Daemon de Fundo (node-cron) e o ícone na System Tray do Windows (Sincronização Invisível).
- [ ] **Teste de Checkpoint:** Disparar uma sincronização mockada no terminal e ver os arquivos físicos nascendo na /PastaBase/.

## Fase 4: O Casamento do Design System (prototype.html)
A conversão literal e rigorosa do seu código HTML nativo para componentes React usando Tailwind.

- [ ] **Tarefa 4.1:** Extrair do seu CSS puro as variáveis para o tailwind.config.js (Azul #2563EB, radius 12px, fontes).
- [ ] **Tarefa 4.2:** Fatiar a estrutura principal: Sidebar com menus e Topbar.
- [ ] **Tarefa 4.3:** Criar o Dashboard com os "4 Cards Financeiros" e o botão gigante Hero.
- [ ] **Teste de Checkpoint:** Abrir a janela do aplicativo Electron e ver a tela estática idêntica ao HTML puro, pixel por pixel.

## Fase 5: Integração Front ↔ Back (Telas e Modais Vivos)
Conectar as telas ao banco de dados e dar vida às ações do usuário.

- [ ] **Tarefa 5.1:** Lógica e Modal de Adicionar Certificados em Lote (Drag & Drop + senhas - UC011).
- [ ] **Tarefa 5.2:** O "Modal de Seleção de Fila" (onde ele escolhe quais CNPJs sincronizar).
- [ ] **Tarefa 5.3:** A Fila Viva (queue-panel). Fazer o React escutar o Node via IPC para animar a barra de progresso verde e os "Spinners" azuis reais.
- [ ] **Tarefa 5.4:** Onboarding Wizard interativo, e tela de Configurações (com exportar .sqlite).
- [ ] **Teste de Checkpoint:** Clicar no UI em "Sincronizar", ver a animação acontecer e, ao final, o Dashboard atualizar sozinho.

## Fase 6: Relatórios e Polimento Final
A última milha para fechar o produto com chave de ouro.

- [ ] **Tarefa 6.1:** Desenvolver o gerador de PDF (PDFKit) das Retenções Fiscais.
- [ ] **Tarefa 6.2:** Desenvolver o gerador de XLSX (ExcelJS) pareado com a mesma lógica.
- [ ] **Teste de Checkpoint:** Realizar fluxo 100% real com um certificado real de teste e abrir o PDF/Excel final no Windows.
