# Design: Fundação Core e Banco de Dados (NFSe Sync Desktop - Fase 1)

## Arquitetura
A fundação materializa o diagrama de componentes da Seção 2. O `Main Process` controlará de forma exclusiva a instância do banco local SQLite (`better-sqlite3`).

---

## Componentes

### Banco Local / Tabelas (Seção 5)
Implementação exata da modelagem através do Kysely TypeScript Builder:
* **`configuracoes`**: Contém o campo `delay_throttle` que controlará o backoff da Sefaz depois.
* **`certificados`**: Grava a senha em blob binário (`senha_criptografada`).
* **`documentos`**: Usa Enum Checks rígidos nativos (`ATIVA`, `CANCELADA`, `SUBSTITUIDA`) em vez de checar isso no lado do código Node.
* **`retencoes`**: Uma tabela dependente `1:1` para facilitar joins com o Excel e o PDF, sem poluir a tabela de documentos principal com decimais nulos.

### Estrutura de Pastas (Baseada na Seção 8)
A montagem criará os diretórios vitais do Boilerplate:
```text
/project-root
├── electron/
│   ├── main.ts            (Ponto de entrada)
│   ├── preload.ts         (Ponte IPC, contextIsolation=true)
│   └── db/
│       ├── connection.ts  (Instância do better-sqlite3 + PRAGMA WAL)
│       └── migrations/    (Kysely Migration Scripts)
├── src/                   (React Frontend)
│   ├── App.tsx
```

---

## Fluxo Técnico
1. Execução do arquivo `/electron/main.ts`.
2. A classe singleton `/electron/db/connection.ts` é invocada abrindo o `.sqlite`.
3. Os Pragmas de WAL são ativados.
4. O Migrator do Kysely roda varrendo a pasta `/migrations/` para montar as 6 tabelas.
5. A UI do Vite é injetada. O `window.api.ping()` bate na Controller IPC que responde "OK".

---

## Tradeoffs

### Escolha Principal
Optamos pela Tipagem forte do **Kysely** associada à sincronicidade do **better-sqlite3** em Desktop.
*(Por que?)* Evitar ORMs pesados (TypeORM/Prisma) garante um build do Electron extremamente magro (o que é vital para downloads rápidos do .exe e baixo consumo de RAM nas máquinas velhas das contabilidades).
