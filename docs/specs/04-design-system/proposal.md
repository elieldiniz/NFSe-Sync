# Proposal: Casamento do Design System (NFSe Sync Desktop - Fase 4)

## Objetivo
Transcrever as regras CSS brutas, o layout estático e as paletas de cores rígidas descritas no `prototype.html` e na Seção 9 da especificação (`project-nfse-desktop.md`) para o ambiente React (utilizando TailwindCSS). O produto final desta fase deve ser uma cópia pixel a pixel do mockup, garantindo a "Estética Premium" governada pela regra do negócio.

---

## Motivação
A documentação principal estipula severamente: "O software deve parecer moderno, rápido e confiável... e se afastar completamente do visual cinza e pesado de ERPs fiscais". O Design Token da cor primária `#2563EB` (Azul Segurança) e o Border Radius absoluto de `12px` devem nortear todos os botões e inputs Shadcn que instalaremos.

---

## Escopo

### Incluído
* Instalação do TailwindCSS no ecossistema Vite + React.
* Configuração do `tailwind.config.js` com a paleta exata (Tokens) extraída da tag `<style>` do `prototype.html`.
* Fatiamento do `prototype.html` em componentes estáticos e limpos: `Sidebar`, `Topbar` e `Dashboard`.
* Criação do grid paramétrico estático: `<div class="metric-grid">` contendo os 4 Cards de totalização.
* Setup da fonte primária (Inter).

### Fora do escopo
* Qualquer lógica dinâmica de IPC (Tabelas vazias ou dados estáticos, sem chamadas de backend - Fase 5).
* Animação real da barra de progresso (Fase 5).

---

## Impacto (Análise Inicial)

### Frontend (React)
A UI principal será dividida para que o Zustand (na fase posterior) possa re-renderizar partes pequenas da tela (como a barra de progresso) sem causar flickering em toda a `Sidebar`.

### Infraestrutura
Aumento de dependências do Frontend (Tailwind, Lucide-react / Tabler-icons).

---

## Riscos
* **Quebra de Padding/Margem Global**: Usar componentes do Shadcn puros pode inserir tamanhos de botões ligeiramente diferentes do que criamos na unha no HTML.
* **Mitigação**: O `tailwind.config.js` estenderá o tema sobrescrevendo as bordas `rounded-xl` para forçar os `12px` rígidos para bater exatamente com o protótipo.

---

## Dependências
* Necessita da janela do Electron abrindo corretamente (Fase 1).
