# Design: Integração Front ↔ Back (NFSe Sync Desktop - Fase 5)

## Arquitetura
Como definido no `project-nfse-desktop.md` (Seção 2.1 e Diagrama), a UI do React deve utilizar o `Zustand` como Gerenciador de Estado Global Local, em vez do Redux ou manipulação por Prop Drilling. O estado do Sistema (Sincronizando vs Idle) ditará a mutação de componentes como a Barra de Busca (que some) e o Progresso (que aparece). O FrontEnd invocará APENAS o método injetado pelo Context Bridge (`window.api`), preservando o forte sandboxing de segurança.

---

## Componentes

### API / Controllers (Ponte IPC Preload)
* **`preload.ts`**: Adição dos listeners de via dupla. Exemplo de tipagem restrita:
  `onSyncProgress: (callback) => ipcRenderer.on('sync:progress', callback)`
* **`Zustand Store`**: Extrator e curador das emissões IPC que afetam renderização visual da DOM.

### Lógica de Negócio UI (Modais Específicos)
* **`ModalCertLote.tsx`**: Componente do Frontend (UC011) que captura propriedades de `event.dataTransfer.files` (HTML nativo).
* **`ModalSelecao.tsx`**: O painel (UC002) acionado pelo Botão "Sincronizar", com uma `<input type="search">` e tabela de CNPJs lidas via IPC (`SELECT * FROM certificados`).
* **`QueuePanel.tsx`**: O exato espelhamento do `<div id="queue-panel">` implementado na Fase 4, mas agora reativo ao Zustand Store `progressState`.

---

## Fluxo Técnico (Exemplo Modal UC011)
1. Usuário solta 10 PFXs na dropzone e digita 2 senhas (`123456`, `senha1`).
2. O React transforma em um Array map contendo as `path` literais do file system.
3. IPC Channel bate no Node (`main.ts`).
4. Backend roda um Loop com `node-forge`. Testando o decrypt do arquivo 1 com as duas senhas.
5. Se descriptografou, insere CNPJ no banco.
6. Backend encerra array e retorna `[ { cnpj: X, success: true }, { path: Y, error: "senha" } ]`.
7. React renderiza tabela vermelha/verde (Feedback L332 do DOC).

---

## Tradeoffs

### Escolha Principal
O uso de uma Bridge tipada (`window.api`) + Zustand.
*(Por que?)* Porque injetar eventos diretos no DOM causaria uma dessincronização bizarra nos contadores React. Centralizar o progresso de barra e NSU na Store do Zustand previne vazamentos de Listener (`ipcRenderer.on` múltiplo).

### Alternativa Rejeitada
Permitir que a Interface Web manipule diretamente arquivos Dropados.
*(Por que foi descartada?)* Fazer ler o buffer de um arquivo e gerar criptografia no navegador (Vite) travaria a interface e faria o Electron disparar alertas de CPU para o OS do cliente. O backend deve mastigar arquivos.

---

## ADRs Relacionadas
* Documentação base: `project-nfse-desktop.md` (Diagrama Arquitetural de Componentes, UC011, UC002, UC007).
