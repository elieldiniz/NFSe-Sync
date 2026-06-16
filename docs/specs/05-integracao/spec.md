# Specification: Integração Front ↔ Back (NFSe Sync Desktop - Fase 5)

## Objetivo
Conectar todos os componentes estáticos da Fase 4 ao backend das Fases 1-3 via IPC. Esta fase implementa UC002, UC006, UC007, UC008, UC009, UC011 — todos os fluxos interativos do produto.

---

# Requirements

## REQ-051: Fila Viva no Dashboard (UC002 / Seção 9.3 B)
**GIVEN** o usuário abrir o Modal de Seleção e clicar "Iniciar"
**WHEN** o `SyncService` do Main Process emitir `sync:progress`
**THEN** o Zustand Store deve atualizar `{ empresa, nsu, docs, progress }`
**AND** a `<div id="prog-bar">` deve refletir `style={{ width: \`${progress}%\` }}`
**AND** o botão Hero "Sincronizar Agora" deve desaparecer
**AND** os itens da fila devem exibir: `✓ Concluída`, `⟳ Processando...`, `⏳ Na Fila`.

---

## REQ-052: Modal de Seleção de Empresas (UC002)
**GIVEN** o usuário clicar em "Sincronizar Agora"
**WHEN** o modal abrir
**THEN** carregar lista do banco via `window.api.getCertificates()`
**AND** exibir: Razão Social, CNPJ, Status de Validade, Última Sincronização
**AND** certificados vencidos devem ter checkbox `disabled` e label "Expirado"
**AND** uma barra de busca deve filtrar por nome em tempo real
**AND** botão "Selecionar Todas" (apenas as válidas) deve existir.

---

## REQ-053: Importação em Lote - Drag & Drop (UC011)
**GIVEN** o usuário acessar a Dropzone na tela de Certificados
**WHEN** arrastar N arquivos `.pfx`
**AND** preencher 1 a 3 senhas no campo de texto
**THEN** invocar `window.api.addBatchCerts({ files: string[], senhas: string[] })`
**AND** o backend tenta cada senha em cada PFX via `node-forge`
**AND** extrai CNPJ e Razão Social do PFX aprovado
**AND** insere na tabela `certificados`
**AND** retorna array `[{ cnpj, razao_social, success: true } | { file, error: 'senha incorreta' }]`
**AND** o Frontend renderiza tabela de resultado com linhas verdes/vermelhas.

---

## REQ-054: Wizard de Onboarding Funcional (UC006)
**GIVEN** o React detectar via `window.api.checkFirstRun()` que `configuracoes` está vazia
**WHEN** o Wizard for exibido
**THEN** o Passo 1 deve abrir `dialog.showOpenDialog` via `window.api.selectBaseFolder()`
**AND** o caminho retornado deve ser salvo no estado e inserido na tabela `configuracoes`
**AND** o Passo 2 deve abrir o Modal de Cadastro de Certificado
**AND** somente após ambos concluídos, navegar para o Dashboard.

---

## REQ-055: Reprocessamento do Zero - Danger Zone (UC007)
**GIVEN** o usuário clicar em "Reprocessar do Zero" nas configurações avançadas de uma empresa
**WHEN** confirmar o alerta de segurança
**THEN** invocar `window.api.resetCertificado(id)`
**AND** o Main Process executar: `DELETE FROM documentos WHERE certificado_id = ?`
**AND** em seguida: `UPDATE certificados SET ultimo_nsu = 0 WHERE id = ?`
**AND** exibir notificação de sucesso no Frontend.

---

## REQ-056: Backup Funcional (UC008 / RN014)
**GIVEN** o usuário clicar em "Exportar Backup" nas Configurações
**WHEN** `window.api.backupExport()` for chamado
**THEN** abrir `dialog.showSaveDialog` e salvar via `db.backup(destino)`
**GIVEN** o usuário clicar em "Importar Backup"
**WHEN** `window.api.backupImport(filepath)` for chamado
**THEN** executar `PRAGMA integrity_check` no arquivo
**AND** se válido, substituir banco e reiniciar conexão via `fs.renameSync`.

---

## REQ-057: Tela de Ajuda e Guia (UC009)
**GIVEN** o usuário clicar em "Ajuda" na Sidebar
**WHEN** a tela carregar
**THEN** exibir explicação didática de: como o sistema funciona, onde os arquivos ficam, tipos de relatórios e glossário (PFX, NSU, Rate Limit)
**AND** botão "Abrir Pasta Raiz" que invoca `shell.openPath(pasta_base)` via IPC
**AND** botão "Copiar Log de Erros" que lê `sync_erros` e copia para Clipboard.

---

# Constraints (Restrições)
* **Zustand granular**: O estado de progresso deve ser um sub-slice isolado. Re-renders da barra de progresso não devem re-renderizar a Sidebar inteira.

---

# Acceptance Criteria
* [ ] Drop de 3 PFXs com senha correta cria 3 certificados no banco.
* [ ] Certificado vencido aparece `disabled` no Modal de Seleção.
* [ ] Barra de progresso anima de 0 a 100% durante sync mock.
* [ ] Botão "Abrir Pasta Raiz" abre o Explorer/Finder no caminho correto.
* [ ] Backup exportado pode ser importado sem erros de `integrity_check`.
* [ ] Reset de NSU zera o campo e apaga documentos do certificado selecionado.
