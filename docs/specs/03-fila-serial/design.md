# Design: A Fila Serial e a Orquestração (NFSe Sync Desktop - Fase 3)

## Arquitetura
O coração é um Service Singleton (`SyncService.ts`) que atua como uma fila local (Fifo). Ele isola completamente o processo do banco de dados e da Sefaz. Teremos o `node-cron` injetado no Main Process, lendo a Tabela `configuracoes` para verificar de quanto em quanto tempo deve acordar e puxar os certificados aplicáveis.

---

## Componentes

### Lógica de Negócio (Services/Actions)
* **`/electron/services/sync.ts`**: Controlador central de estado. Ele gerencia o loop de repetição do NSU. Inicia o Array temporal `arquivosPendentes[]` no início de cada batch (lote de Sefaz). 
* **`/electron/services/fs_manager.ts`**: Helper simples em volta do `fs` nativo do NodeJS. Valida a criação das subpastas (`Emitidas`, `Recebidas`, `Retencoes/XML`) recursivamente antes do `fs.writeFileSync`.

### Integração do Sistema Operacional (Tray)
* **`/electron/main.ts` (Atualização)**: Inclusão das dependências nativas para ancorar a Tray App (Bandeja do Sistema Windows/Linux) e configurar o menu contextual de cliques ("Sincronizar Todas", "Pausar Automático").

---

## Fluxo Técnico (Loop Mestre NSU)
1. Trigger: Ui do React ou Daemon disparar `SyncService.start(['id-cert-1', 'id-cert-2'])`.
2. O Serviço puxa o primeiro certificado, extrai o último NSU do Banco SQLite.
3. Entra em `while (tem_mais_nsu)` chamando a Fase 2 (`sefaz.ts`).
4. Para o lote recebido:
   * Itera cada XML, injeta no parser (Fase 2).
   * Chama o `fs_manager.ts` e escreve no disco. Salva o caminho em `arquivosPendentes`.
5. Se falhar: Dá `fs.unlinkSync` de tudo em `arquivosPendentes` e dá `ROLLBACK`.
6. Se sucesso: Joga o lote de metadados pro Kysely `INSERT OR IGNORE`, commita e joga o novo NSU máximo pro Banco. Continua o `while`.
7. Fim do While: Próximo certificado do Trigger (Passo 2).
8. Fim Geral: Emite Notificação de SO via `electron.Notification`.

---

## Tradeoffs

### Escolha Principal
O uso intensivo do comando `INSERT OR IGNORE`.
*(Por que?)* Ao invés de fazer milhares de queries `SELECT id FROM documentos WHERE chave = X` (o que atrasaria brutalmente a transação), nós delegamos a checagem de duplicidade nativamente para o C++ do SQLite, poupando CPU e ganhando velocidade absoluta.

### Alternativa Rejeitada
Escrever primeiro no Banco de Dados para depois baixar / escrever o XML do disco.
*(Por que foi descartada?)* Se nós gravamos o metadado no banco antes de garantir que a operação de disco foi validada e concluída (I/O bloqueante do Windows), teríamos o banco informando que o documento foi processado, mas ao abrir a pasta, o contador veria nada. Sempre escreveremos no disco primeiro, e se falhar o Kysely nem toma conhecimento.

---

## ADRs Relacionadas
* Documentação base: `project-nfse-desktop.md` (UC010 e RN001/RN013).
