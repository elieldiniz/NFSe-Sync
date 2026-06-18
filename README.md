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

### Opcao 1: AppImage (Linux)

1. **Baixe o arquivo** `NFSe Sync Desktop-2.2.0.AppImage`

2. **Torne executavel:**
   ```bash
   chmod +x "NFSe Sync Desktop-2.2.0.AppImage"
   ```

3. **Execute:**
   ```bash
   ./NFSe\ Sync\ Desktop-2.2.0.AppImage
   ```

4. **(Opcional) Instalar no sistema:**
   - Clique com o botao direito no arquivo
   - Selecione "Integrar ao sistema" (depende da distribuicao)

### Opcao 2: Compilar do Codigo

1. **Clone o repositorio:**
   ```bash
   git clone https://github.com/seu-usuario/nfse-sync-desktop.git
   cd nfse-sync-desktop
   ```

2. **Instale as dependencias:**
   ```bash
   npm install
   ```

3. **Compile o aplicativo:**
   ```bash
   npm run build
   ```

4. **Gere o instalador:**
   ```bash
   # Para Linux
   npm run build:linux

   # Para Windows
   npm run build:win

   # Para Mac
   npm run build:mac
   ```

5. **O instalador sera gerado na pasta `release/`**

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
