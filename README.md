# NFSe Sync Desktop

**NFSe Sync Desktop** é uma aplicação desktop robusta desenvolvida com Electron, React e TypeScript, focada na automação, download, organização e backup de Notas Fiscais de Serviço eletrônicas (NFS-e).

## 🚀 Principais Funcionalidades

- **Sincronização com SEFAZ:** Integração para busca e download automatizado de notas fiscais.
- **Gestão de Certificados:** Gerenciamento centralizado de certificados digitais para autenticação.
- **Parser de XML:** Processamento eficiente de arquivos XML de NFS-e.
- **Relatórios:** Geração de relatórios detalhados sobre as notas processadas.
- **Backup Automático:** Sistema de backup para garantir a segurança dos dados e das notas baixadas.
- **Dashboard Intuitivo:** Interface moderna para acompanhamento em tempo real das operações.
- **Configurações Flexíveis:** Personalização de pastas base, automação e regras de sincronização.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Tailwind CSS, Zustand (Estado), Tabler Icons.
- **Backend (Desktop):** Electron, Node.js.
- **Build Tool:** electron-vite.
- **Banco de Dados:** SQLite (via Better-SQLite3 e Kysely).
- **Processamento:** Fast-XML-Parser, ExcelJS (Relatórios), PDFKit.
- **Testes:** Vitest.

## 📁 Estrutura do Projeto

```text
aplication-descktop/
├── electron/           # Código do processo Main do Electron
│   ├── db/            # Migrações e setup do SQLite
│   ├── main/          # Entrada principal do Electron
│   ├── preload/       # Scripts de ponte (Bridge) entre Main e Renderer
│   └── services/      # Lógica de negócio (Sync, Sefaz, Certs, etc)
├── src/                # Código do processo Renderer (React)
│   ├── components/    # Componentes de UI
│   ├── hooks/         # Hooks customizados
│   ├── store/         # Gerenciamento de estado (Zustand)
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Ponto de entrada React
├── resources/          # Ativos estáticos (ícones, etc)
├── out/                # Build final da aplicação
└── package.json        # Dependências e scripts
```

## 🔧 Como Executar

### Pré-requisitos
- Node.js (v18 ou superior recomendado)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre na pasta
cd aplication-descktop

# Instale as dependências
npm install
```

### Desenvolvimento
```bash
# Inicie a aplicação em modo de desenvolvimento
npm run dev
```

### Build
```bash
# Gere o executável para produção
npm run build
```

## 🧪 Testes e Qualidade

```bash
# Executar testes unitários
npm run test

# Verificar tipos (TypeScript)
npm run typecheck

# Linting
npm run lint
```

---
Desenvolvido por **Eliel**.
