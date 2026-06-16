import Database from 'better-sqlite3'

export function runMigrations(db: Database.Database): void {
  // Create migration tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Check if migration already applied
  const applied = db.prepare('SELECT name FROM _migrations WHERE name = ?').get('001_initial_schema')
  if (applied) return

  // Begin transaction for migration
  const migrate = db.transaction(() => {
    // TABELA: configuracoes (Geral do App)
    db.exec(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id TEXT PRIMARY KEY,
        pasta_base TEXT NOT NULL,
        delay_throttle INTEGER DEFAULT 2000,
        sinc_intervalo_horas INTEGER DEFAULT 24,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // TABELA: certificados
    db.exec(`
      CREATE TABLE IF NOT EXISTS certificados (
        id TEXT PRIMARY KEY,
        cnpj TEXT NOT NULL UNIQUE,
        razao_social TEXT NOT NULL,
        caminho_pfx TEXT NOT NULL,
        senha_criptografada BLOB NOT NULL,
        validade_cert DATETIME NOT NULL,
        sinc_automatica BOOLEAN DEFAULT 1,
        ultimo_nsu INTEGER DEFAULT 0,
        ultima_sincronizacao DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // TABELA: sincronizacoes (Motor de Log)
    db.exec(`
      CREATE TABLE IF NOT EXISTS sincronizacoes (
        id TEXT PRIMARY KEY,
        certificado_id TEXT NOT NULL REFERENCES certificados(id),
        data_inicio DATETIME NOT NULL,
        data_fim DATETIME,
        nsu_inicial INTEGER NOT NULL,
        nsu_final INTEGER,
        documentos_processados INTEGER DEFAULT 0,
        retencoes_encontradas INTEGER DEFAULT 0,
        status TEXT NOT NULL CHECK(status IN ('EM_ANDAMENTO', 'SUCESSO', 'ERRO', 'FALHA_CONEXAO'))
      )
    `)

    // TABELA: sync_erros (Logs Granulares - RN011)
    db.exec(`
      CREATE TABLE IF NOT EXISTS sync_erros (
        id TEXT PRIMARY KEY,
        sincronizacao_id TEXT NOT NULL REFERENCES sincronizacoes(id) ON DELETE CASCADE,
        nsu INTEGER NOT NULL,
        mensagem TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // TABELA: documentos (Única Fonte de Consultas)
    db.exec(`
      CREATE TABLE IF NOT EXISTS documentos (
        id TEXT PRIMARY KEY,
        certificado_id TEXT NOT NULL REFERENCES certificados(id),
        chave_documento TEXT UNIQUE NOT NULL,
        numero_nota TEXT NOT NULL,
        tipo TEXT NOT NULL CHECK(tipo IN ('EMITIDA', 'RECEBIDA', 'EVENTO')),
        status TEXT DEFAULT 'ATIVA' CHECK(status IN ('ATIVA', 'CANCELADA', 'SUBSTITUIDA')),
        data_emissao DATETIME NOT NULL,
        competencia TEXT NOT NULL,
        cnpj_prestador TEXT,
        nome_prestador TEXT,
        cnpj_tomador TEXT,
        nome_tomador TEXT,
        caminho_xml TEXT NOT NULL,
        possui_retencao BOOLEAN DEFAULT 0,
        valor_total REAL DEFAULT 0.0
      )
    `)

    // 3 indexes obrigatórios
    db.exec(`CREATE INDEX IF NOT EXISTS idx_docs_competencia ON documentos(competencia)`)
    db.exec(`CREATE INDEX IF NOT EXISTS idx_docs_tipo ON documentos(tipo)`)
    db.exec(`CREATE INDEX IF NOT EXISTS idx_docs_status ON documentos(status)`)

    // TABELA: retencoes (Extensão 1:1)
    db.exec(`
      CREATE TABLE IF NOT EXISTS retencoes (
        id TEXT PRIMARY KEY,
        documento_id TEXT UNIQUE NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
        iss REAL DEFAULT 0.0,
        inss REAL DEFAULT 0.0,
        irrf REAL DEFAULT 0.0,
        pis REAL DEFAULT 0.0,
        cofins REAL DEFAULT 0.0,
        csll REAL DEFAULT 0.0,
        total_retido REAL DEFAULT 0.0
      )
    `)

    // Record migration
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run('001_initial_schema')
  })

  migrate()
}
