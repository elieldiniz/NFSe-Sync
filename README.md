# NFSe Sync Desktop

**Autor:** Eliel Diniz  
**Email:** elieldiniz1@outlook.com  
**Versao:** 2.2.0

Aplicativo desktop para automacao de download e organizacao de NFS-e (Nota Fiscal de Servico Eletronica) junto a Sefaz Nacional.

## Funcionalidades

- **Sincronizacao Automatica:** Baixa documentos NFS-e diretamente da Sefaz
- **Organizacao Automatica:** Organiza XMLs por empresa, competencia e tipo (Emitidas/Recebidas/Eventos)
- **Deteccao de Retencoes:** Identifica e separa notas com retencao (ISS, INSS, IRRF, PIS, COFINS, CSLL)
- **Relatorios:** Gera relatorios PDF e Excel de retencoes por competencia
- **Dashboard por Empresa:** Visualiza metricas e composicao de retencoes
- **Backup:** Exportacao e importacao do banco de dados
- **System Tray:** Minimiza para a bandeja do sistema

---

## Como Instalar

### Requisitos Previos

- **Node.js** v18 ou superior: https://nodejs.org
- **npm** (vem junto com o Node.js)
- **Git**: https://git-scm.com

---

### Linux (Ubuntu/Debian)

#### Instalar Dependencias do Sistema

```bash
# Atualizar repositorios
sudo apt update

# Instalar Node.js e npm
sudo apt install -y nodejs npm

# Instalar dependencias para Electron
sudo apt install -y libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libsecret-1-0

# Instalar dependencias para compilar nativos
sudo apt install -y build-essential python3
```

#### Compilar e Instalar

```bash
# Clonar o repositorio
git clone https://github.com/seu-usuario/nfse-sync-desktop.git
cd nfse-sync-desktop

# Instalar dependencias do projeto
npm install

# Compilar e gerar instaladores
npm run build:linux
```

#### Instalar o AppImage

```bash
# Navegar ate a pasta release
cd release

# Tornar o AppImage executavel
chmod +x "NFSe Sync Desktop-2.2.0.AppImage"

# Executar
./"NFSe Sync Desktop-2.2.0.AppImage"
```

#### Instalar o Pacote .deb

```bash
# Navegar ate a pasta release
cd release

# Instalar o pacote
sudo dpkg -i nfse-sync-desktop_2.2.0_amd64.deb

# Corrigir dependencias (se necessario)
sudo apt-get install -f

# Executar
nfse-sync-desktop
```

#### Criar Atalho no Menu

Crie um arquivo `.desktop` em `/usr/share/applications/`:

```bash
sudo nano /usr/share/applications/nfse-sync-desktop.desktop
```

Cole o conteudo:

```ini
[Desktop Entry]
Name=NFSe Sync Desktop
Comment=Automacao de download e organizacao de NFS-e
Exec=/home/seu-usuario/nfse-sync-desktop/release/linux-unpacked/nfse-sync-desktop
Icon=/home/seu-usuario/nfse-sync-desktop/resources/icon.png
Type=Application
Categories=Office;
Terminal=false
```

Salve e saia (Ctrl+O, Enter, Ctrl+X).

---

### Windows

#### Instalar Dependencias do Sistema

1. **Baixe e instale o Node.js:** https://nodejs.org
   - Selecione a versao LTS
   - Marque a opcao "Automatically install the necessary tools"

2. **Instale o Git:** https://git-scm.com

3. **Instale o Visual C++ Build Tools** (opcional, para pacotes nativos):
   ```powershell
   # No PowerShell como administrador
   npm install -g windows-build-tools
   ```

#### Compilar e Instalar

```powershell
# Abrir PowerShell ou CMD

# Clonar o repositorio
git clone https://github.com/seu-usuario/nfse-sync-desktop.git
cd nfse-sync-desktop

# Instalar dependencias do projeto
npm install

# Compilar e gerar instalador
npm run build:win
```

#### Instalar o Aplicativo

1. Navegue ate a pasta `release`
2. Execute o arquivo `NFSe Sync Desktop Setup 2.2.0.exe`
3. Siga o assistente de instalacao
4. O app sera instalado em `C:\Program Files\NFSe Sync Desktop\`

#### Criar Atalho na Area de Trabalho

1. Navegue ate `C:\Program Files\NFSe Sync Desktop\`
2. Clique com o botao direito em `nfse-sync-desktop.exe`
3. Selecione **"Enviar para"** > **"Area de trabalho (criar atalho)"**

---

### Mac

#### Instalar Dependencias do Sistema

```bash
# Instalar Homebrew (se nao tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Instalar Git
brew install git
```

#### Compilar e Instalar

```bash
# Clonar o repositorio
git clone https://github.com/seu-usuario/nfse-sync-desktop.git
cd nfse-sync-desktop

# Instalar dependencias do projeto
npm install

# Compilar e gerar DMG
npm run build:mac
```

#### Instalar o Aplicativo

1. Navegue ate a pasta `release`
2. Abra o arquivo `NFSe Sync Desktop-2.2.0.dmg`
3. Arraste o app para a pasta `Applications`
4. Abra o app pelo Launchpad ou Spotlight

---

### Resumo dos Comandos

| Sistema | Comando para Compilar | Arquivo Gerado |
|---------|----------------------|----------------|
| Linux | `npm run build:linux` | `NFSe Sync Desktop-2.2.0.AppImage` |
| Linux | `npm run build:linux` | `nfse-sync-desktop_2.2.0_amd64.deb` |
| Windows | `npm run build:win` | `NFSe Sync Desktop Setup 2.2.0.exe` |
| Mac | `npm run build:mac` | `NFSe Sync Desktop-2.2.0.dmg` |

---

### Solucao de Problemas

#### Erro: "libXss.so.1: cannot open shared object file" (Linux)

```bash
sudo apt install -y libxss1
```

#### Erro: "better-sqlite3" falha ao compilar (Linux)

```bash
sudo apt install -y build-essential python3
npm rebuild better-sqlite3
```

#### Erro: "Electron" nao inicia (Windows)

1. Instale o Visual C++ Build Tools
2. Reinicie o computador
3. Execute `npm rebuild` no projeto

#### Erro: "Permissao negada" ao executar AppImage (Linux)

```bash
chmod +x "NFSe Sync Desktop-2.2.0.AppImage"
```

#### Erro: "Module not found" apos clonar

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## Como Usar

### 1. Primeira Execucao

Ao abrir o aplicativo pela primeira vez, o wizard de configuracao sera exibido:

1. **Selecione a pasta base** onde os XMLs serao salvos
2. **Adicione seu primeiro certificado** digital (arquivo .pfx)
3. **Digite a senha** do certificado
4. Clique em **"Salvar"**

### 2. Adicionar Certificados

1. Acesse a tela **"Certificados"** no menu lateral
2. Clique em **"Adicionar Certificado"**
3. Selecione o arquivo `.pfx` ou `.p12`
4. Digite a senha
5. Clique em **"Salvar"**

### 3. Sincronizar com a Sefaz

1. Na tela de **"Certificados"**, selecione as empresas
2. Clique em **"Sincronizar Agora"**
3. Aguarde o processo finalizar
4. Os XMLs serao salvos na pasta base organizados por:
   ```
   Pasta Base/
   └── NFSENacional/
       └── 58691369000178 - ZELOSA LIMPEZA/
           └── 2026-06/
               ├── Emitidas/
               │   └── NFSE_12345_chave.xml
               ├── Recebidas/
               │   └── NFSE_67890_chave.xml
               ├── Eventos/
               │   └── EVENTO_CANCELAMENTO_chave.xml
               └── Retencoes/
                   ├── XML/
                   │   └── NFSE_12345_chave.xml
                   ├── Relatorio_Retencoes_2026-06.pdf
                   └── Relatorio_Retencoes_2026-06.xlsx
   ```

### 4. Gerar Relatorios

1. Acesse **"Relatorios"** no menu lateral
2. Selecione a empresa
3. Clique em **"Gerar Relatorio"** na competencia desejada
4. O relatorio PDF sera aberto automaticamente

### 5. Dashboard da Empresa

1. Na tela de **"Certificados"**, clique no icone **"Grafico"** (ao lado do botao Editar)
2. Visualize:
   - Total de documentos
   - Total retido
   - Composicao das retencoes (grafico de pizza)

### 6. Backup

1. Acesse **"Configuracoes"**
2. Clique em **"Exportar Backup"** para salvar o banco de dados
3. Para restaurar, clique em **"Importar Backup"** e selecione o arquivo `.sqlite`

---

## Comandos de Desenvolvimento

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia o modo desenvolvimento |
| `npm run build` | Compila o projeto |
| `npm run build:linux` | Gera AppImage para Linux |
| `npm run build:win` | Gera instalador para Windows |
| `npm run build:mac` | Gera DMG para Mac |
| `npm run typecheck` | Verifica erros de tipo |
| `npm run test` | Executa testes |

---

## Estrutura do Projeto

```
nfse-sync-desktop/
├── electron/                    # Codigo Electron (backend)
│   ├── db/                      # Banco de dados
│   │   ├── connection.ts        # Conexao SQLite
│   │   ├── types.ts             # Interfaces TypeScript
│   │   ├── migrations/          # Migracoes do banco
│   │   └── repositories/        # Camada de acesso a dados
│   ├── main/                    # Processo principal
│   │   ├── index.ts             # Ponto de entrada
│   │   ├── window.ts            # Gerenciamento de janelas
│   │   ├── cron.ts              # Tarefas agendadas
│   │   └── ipc/                 # Handlers IPC
│   ├── services/                # Logica de negocio
│   │   ├── sync.service.ts      # Sincronizacao com Sefaz
│   │   ├── reports.service.ts   # Geracao de relatorios
│   │   └── cert.service.ts      # Manipulacao de certificados
│   ├── preload/                 # Bridge entre processos
│   └── utils/                   # Funcoes utilitarias
├── src/                         # Codigo React (frontend)
│   ├── features/                # Modulos da aplicacao
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── certificates/        # Gestao de certificados
│   │   ├── sync/                # Historico de sincronizacoes
│   │   ├── reports/             # Relatorios de retencoes
│   │   ├── empresa/             # Dashboard por empresa
│   │   └── settings/            # Configuracoes
│   ├── layout/                  # Layout da aplicacao
│   ├── shared/                  # Componentes compartilhados
│   └── services/                # Servicos do frontend
├── resources/                   # Recursos (icones)
├── electron-builder.yml         # Configuracao de empacotamento
└── package.json
```

---

## Tecnologias

- **Electron** - Framework desktop
- **React** - Interface do usuario
- **TypeScript** - Tipagem estatica
- **Vite** - Build tool
- **Tailwind CSS** - Estilizacao
- **better-sqlite3** - Banco de dados SQLite
- **PDFKit** - Geracao de PDF
- **ExcelJS** - Geracao de Excel
- **node-forge** - Manipulacao de certificados

---

## Regras de Negocio

- **RN001/RN002:** Sincronizacao em transacao batch
- **RN003:** INSERT OR IGNORE para prevenir duplicatas
- **RN004/RN005:** Filtro de status obrigatorio nas queries
- **RN006-RN008:** Classificacao por CNPJ (Emitidas/Recebidas/Eventos)
- **RN009:** Senha criptografada e limpa da memoria apos uso
- **RN010:** Tratamento de eventos de cancelamento
- **RN011:** Log granular de erros de sincronizacao
- **RN012:** Sincronizacao serial FIFO
- **RN013:** Protecao contra arquivos orphan

---

## Licenca

MIT License

---

## Contato

**Eliel Diniz**  
Email: elieldiniz1@outlook.com
