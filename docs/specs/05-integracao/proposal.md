# Proposal: Integração Front ↔ Back (NFSe Sync Desktop - Fase 5)

## Objetivo
Analisar as lógicas do Backend (Fases 1, 2, 3) e vinculá-las aos modais interativos projetados no UI (Fase 4). Esta fase traz Vida à aplicação através das chamadas de contexto do Zustand escutando os barramentos IPC, especificamente implementando a importação do PFX (UC011), o controle de NSU (UC007) e o modal mestre da Fila de Sincronização (UC002).

---

## Motivação
Um aplicativo React engessado sem comunicação reativa perde seu valor perante a proposta tecnológica do Electron. Precisamos de respostas visuais instantâneas quando o orquestrador iterar sobre arquivos maciços no disco. O contador quer ver a barra de progresso verde andar nota-a-nota.

---

## Escopo

### Incluído
* **Gestão de Estado**: Setup do Zustand para centralizar as requisições API na `Context Bridge`.
* **UC011 (Lote de Certificados)**: Implementação literal da zona "Drag & Drop" que passa os binários brutos do PFX pro `node-forge`.
* **UC002 (Seleção e Barra Viva)**: Implementação do Modal e da área mapeada como `<div id="queue-panel">` no HTML, alterando a barra de progresso (`#prog-bar`) em milissegundos.
* **UC006 e UC007**: Modais de Wizard (Onboarding da pasta base) e Reprocessamento manual da Zona de Perigo (Zerar NSU via DELETE/UPDATE).

### Fora do escopo
* Exportar PDF ou Excel (Isso será tratado na Fase 6).
* Modificar pragmas de sqlite.

---

## Impacto (Análise Inicial)

### Frontend (React)
Toda a interação pesada de Drag & Drop vai gerar uma montagem dinâmica massiva (ex: renderizar a resposta da validação de 50 senhas incorretas na tela de grid em centésimos de segundo).

### Banco de Dados
O Frontend fará requisições de Leitura em tempo real na base (ex: `SELECT * FROM certificados`) e atualizará a tela `Certificados.tsx` sem causar memory leaks.

---

## Riscos
* **Flickering Visual / Re-renders**: Fazer a barra de progresso (`#prog-bar`) ser parte do Estado Global de topo no React fará a aplicação inteira piscar 500 vezes por lote.
* **Mitigação**: Zustand focado e mapeamento reativo apenas em sub-componentes mínimos da árvore para suportar emissões IPC rápidas.

---

## Dependências
* Exige que as emissões `IPC.on('sync:progress')` criadas na Orquestração da Fase 3 estejam testadas.
