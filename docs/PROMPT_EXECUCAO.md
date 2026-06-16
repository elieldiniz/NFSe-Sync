# Prompt de Execução: NFSe Sync Desktop v2.2

## Contexto do Projeto

Você é um Engenheiro de Software Sênior responsável por implementar o **NFSe Sync Desktop v2.2**, um aplicativo Electron + React + TypeScript para automação de download e organização de Notas Fiscais de Serviço Eletrônicas via API Nacional da Sefaz.

## Fontes de Verdade (OBRIGATÓRIO LER ANTES DE QUALQUER AÇÃO)

Antes de escrever qualquer linha de código, você DEVE ler e internalizar os seguintes documentos:

1. **Especificação Técnica Principal:**
   `/home/eliel/workspace/projects/aplication-descktop/docs/project-nfse-desktop.md`

2. **Protótipo Visual Aprovado (Lei do Design):**
   `/home/eliel/workspace/projects/aplication-descktop/docs/prototype.html`

3. **Specs de Execução por Fase:**
   - Fase 1: `/home/eliel/workspace/projects/aplication-descktop/docs/specs/01-fundacao-core/`
   - Fase 2: `/home/eliel/workspace/projects/aplication-descktop/docs/specs/02-motor-sefaz/`
   - Fase 3: `/home/eliel/workspace/projects/aplication-descktop/docs/specs/03-fila-serial/`
   - Fase 4: `/home/eliel/workspace/projects/aplication-descktop/docs/specs/04-design-system/`
   - Fase 5: `/home/eliel/workspace/projects/aplication-descktop/docs/specs/05-integracao/`
   - Fase 6: `/home/eliel/workspace/projects/aplication-descktop/docs/specs/06-relatorios/`

## Diretório do Projeto

O código será escrito em:
`/home/eliel/workspace/projects/aplication-descktop/`

## Regras de Execução (INVIOLÁVEIS)

### 1. Execução por Fase e Checkpoint
- Execute **UMA fase por vez**, na ordem numérica (1 → 2 → 3 → 4 → 5 → 6).
- Ao concluir todas as tasks de uma fase, execute o **Teste de Checkpoint** definido no `tasks.md` da fase.
- Só avance para a próxima fase após o Checkpoint passar sem erros.
- **NÃO pule tasks** nem antecipe lógica de fases futuras.

### 2. Fidelidade ao Design (Fase 4 em diante)
- Toda UI gerada deve ser a transcrição **literal** do `prototype.html`.
- Cores, IDs de elementos, classes CSS, border-radius de `12px`, font `Inter` — tudo deve bater exatamente.
- Se um componente React não estiver idêntico ao HTML aprovado, **não avance**.

### 3. Fidelidade às Regras de Negócio
- Cada Regra de Negócio (RN001 a RN014) tem implementação explícita nas specs.
- Não invente alternativas. Se a spec diz `INSERT OR IGNORE`, use exatamente isso.
- Se a spec diz `fs.unlinkSync()` no catch, implemente exatamente isso.

### 4. Segurança Electron (Inegociável)
- `contextIsolation: true` e `nodeIntegration: false` sempre.
- O Frontend (React) jamais acessa `fs`, `crypto` ou qualquer API Node diretamente.
- Tudo passa pela `Context Bridge` definida no `preload.ts`.
- A senha do PFX é nulificada imediatamente após gerar o `https.Agent`.

### 5. Banco de Dados
- O schema SQL implementado deve ser **idêntico** ao da Seção 5 do documento principal.
- Os 3 indexes (`idx_docs_competencia`, `idx_docs_tipo`, `idx_docs_status`) são obrigatórios.
- Nunca use `INSERT` sem `OR IGNORE` para a tabela `documentos`.

### 6. Estrutura de Pastas
- Seguir **exatamente** o Boilerplate da Seção 8 do documento principal.
- Não criar arquivos fora da estrutura definida sem justificativa clara.

## Ordem de Início

Comece pela **Fase 1, primeira task**:

> Ler `/home/eliel/workspace/projects/aplication-descktop/docs/specs/01-fundacao-core/tasks.md`
> e executar cada item na ordem, marcando `[x]` ao concluir cada um.

Ao terminar a Fase 1, reporte:
- Quais tasks foram executadas
- O resultado do Checkpoint
- Aguarde confirmação antes de iniciar a Fase 2.
