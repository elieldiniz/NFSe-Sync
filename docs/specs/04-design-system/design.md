# Design: Casamento do Design System (NFSe Sync Desktop - Fase 4)

## Arquitetura
Como o aplicativo não terá milhares de páginas indexadas por SEO, não instalaremos complexos sistemas de Rotas (React Router DOM) pesados se não for estritamente necessário. O layout primário manterá a `Sidebar` persistente na esquerda e o componente condicional principal à direita (via troca de Estado Simples no App.tsx ou MemoryRouter leve). Todo o CSS Customizado gerado no mockup será traduzido para Utility Classes do TailwindCSS no frontend.

---

## Componentes

### Lógica Estrutural
* **`/src/App.tsx`**: Contêiner base (Wrapper com display Flex).
* **`/src/components/layout/Sidebar.tsx`**: Extração total do trecho `<aside id="sidebar">` do mockup original, contendo as listagens de menus.
* **`/src/components/layout/Topbar.tsx`**: Componente de cabeçalho (`<div class="topbar">`) recebendo Title e Subtitle como Props.
* **`/src/components/dashboard/Dashboard.tsx`**: Página estática de entrada refletindo a classe `page-dashboard` e seus elementos (`metric-grid`).

### Design Tokens e Arquivos CSS
* **`tailwind.config.js`**: Única fonte da verdade visual. Aqui o mapeamento original de `:root` CSS vira variáveis nativas do framework (ex: `colors: { blue: { DEFAULT: '#2563EB', light: '#EFF6FF' } }`).
* **`index.css`**: Reservado apenas para o `@tailwind base;` e a declaração obrigatória da fonte `Inter`.

---

## Fluxo Técnico
1. Inicialização do React.
2. Injeção global das variáveis de cor (`2563EB`) via classes nativas `text-blue` / `bg-blue`.
3. Montagem do esqueleto com `Sidebar` persistente.
4. Renderização do corpo focado no componente estático do Dashboard (`metric-grid` e botão Giant).

---

## Tradeoffs

### Escolha Principal
Traduzir as regras do HTML prototipado "na unha" puramente para Utilitários Tailwind em vez de migrar os CSS literais para SCSS Modules.
*(Por que?)* Tailwind padroniza os espaçamentos das margins/paddings em múltiplos de 4 (ex: `p-4` = `16px`). A documentação exige múltiplos estritos (Seção 9.2). Além disso, reduz o peso final do bundle comparado a dezenas de arquivos `.css`.

### Alternativa Rejeitada
Instalação pesada do Framework Next.js ou Remix dentro do Electron.
*(Por que foi descartada?)* Electron atua lendo o `index.html` compilado. Um sistema SSR (Server Side Rendering) é completamente inútil para o Desktop e traria um Node adicional dentro do Renderer que consumiria centenas de Megabytes do cliente apenas para rotear páginas nativas.

---

## ADRs Relacionadas
* Documentação base: `project-nfse-desktop.md` (Seção 9 - Design System e UI/UX).
