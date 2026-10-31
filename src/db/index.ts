import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/sql-js';
import initSqlJsModule from 'sql.js';
import type { BindParams, Database as SqlJsDatabase } from 'sql.js';
import * as schema from './schema.ts';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const initSqlJs =
  typeof initSqlJsModule === 'function'
    ? initSqlJsModule
    : (initSqlJsModule as unknown as { default: typeof initSqlJsModule }).default;

const wasmBinaryPath = require.resolve('sql.js/dist/sql-wasm.wasm');
const SQL = await initSqlJs({
  locateFile: () => wasmBinaryPath,
});

function resolveWritableDbPath(): string | null {
  const rawEnvPath = process.env.SQLITE_DB_PATH?.trim();
  const preferredPath = rawEnvPath || './trustlink.db';

  if (preferredPath === ':memory:') {
    console.log('[Verilar] Banco SQLite iniciado em memória (:memory:)');
    return null;
  }

  const candidates = [
    path.resolve(PROJECT_ROOT, preferredPath),
    path.join(os.tmpdir(), 'verilar-trustlink.db'),
  ];

  for (const candidate of candidates) {
    try {
      fs.mkdirSync(path.dirname(candidate), { recursive: true });
      if (!fs.existsSync(candidate)) {
        // Testa permissão de escrita na pasta imediatamente
        fs.writeFileSync(candidate, Buffer.alloc(0));
        fs.unlinkSync(candidate);
      }
      return candidate;
    } catch {
      // Tenta próximo caminho candidato caso a pasta seja somente-leitura
    }
  }

  console.warn('[Verilar] Sem permissão de escrita em disco; operando em memória.');
  return null;
}

const activeDbFilePath = resolveWritableDbPath();

function createRawSqlJsInstance(): SqlJsDatabase {
  if (activeDbFilePath && fs.existsSync(activeDbFilePath)) {
    try {
      const existingBytes = fs.readFileSync(activeDbFilePath);
      if (existingBytes.byteLength >= 16) {
        return new SQL.Database(new Uint8Array(existingBytes));
      }
    } catch (err) {
      console.warn(
        '[Verilar] Arquivo de banco existente inválido ou vazio; recriando estrutura limpa.',
        err
      );
    }
  }
  return new SQL.Database();
}

const rawSqlite = createRawSqlJsInstance();
rawSqlite.run('PRAGMA foreign_keys = ON;');

let txDepth = 0;
let wrapperDepth = 0;

function isMutatingSql(upperTrimmedSql: string): boolean {
  return (
    upperTrimmedSql.startsWith('INSERT') ||
    upperTrimmedSql.startsWith('UPDATE') ||
    upperTrimmedSql.startsWith('DELETE') ||
    upperTrimmedSql.startsWith('REPLACE') ||
    upperTrimmedSql.startsWith('CREATE') ||
    upperTrimmedSql.startsWith('ALTER') ||
    upperTrimmedSql.startsWith('DROP')
  );
}

export function getDatabaseFilePath(): string {
  return activeDbFilePath ?? ':memory:';
}

export function persistDatabaseToDisk(): void {
  if (!activeDbFilePath) return;
  const exportedBytes = rawSqlite.export();
  fs.writeFileSync(activeDbFilePath, Buffer.from(exportedBytes));
}

function instrumentSqlJsPersistence(client: SqlJsDatabase): SqlJsDatabase {
  const origPrepare = client.prepare.bind(client);
  const origRun = client.run.bind(client);
  const origExec = client.exec.bind(client);

  client.prepare = ((sqlText: string, params?: BindParams) => {
    const stmt = params !== undefined ? origPrepare(sqlText, params) : origPrepare(sqlText);
    const origStmtRun = stmt.run.bind(stmt);

    stmt.run = ((values?: BindParams) => {
      const isTopLevel = wrapperDepth === 0;
      wrapperDepth += 1;
      const upper = sqlText.trimStart().toUpperCase();

      try {
        if (upper.startsWith('BEGIN')) {
          const res = values !== undefined ? origStmtRun(values) : origStmtRun();
          if (isTopLevel) txDepth += 1;
          return res;
        }

        if (upper.startsWith('COMMIT') || upper.startsWith('END')) {
          const res = values !== undefined ? origStmtRun(values) : origStmtRun();
          if (isTopLevel) {
            txDepth = Math.max(0, txDepth - 1);
            if (txDepth === 0) persistDatabaseToDisk();
          }
          return res;
        }

        if (upper.startsWith('ROLLBACK')) {
          try {
            return values !== undefined ? origStmtRun(values) : origStmtRun();
          } finally {
            if (isTopLevel) txDepth = Math.max(0, txDepth - 1);
          }
        }

        const res = values !== undefined ? origStmtRun(values) : origStmtRun();
        if (isTopLevel && txDepth === 0 && isMutatingSql(upper)) {
          persistDatabaseToDisk();
        }
        return res;
      } finally {
        wrapperDepth -= 1;
      }
    }) as typeof stmt.run;

    return stmt;
  }) as typeof client.prepare;

  client.run = ((sqlText: string, params?: BindParams) => {
    const isTopLevel = wrapperDepth === 0;
    wrapperDepth += 1;
    try {
      const res = params !== undefined ? origRun(sqlText, params) : origRun(sqlText);
      const upper = sqlText.trimStart().toUpperCase();
      if (isTopLevel && txDepth === 0 && isMutatingSql(upper)) {
        persistDatabaseToDisk();
      }
      return res;
    } finally {
      wrapperDepth -= 1;
    }
  }) as typeof client.run;

  client.exec = ((sqlText: string, params?: BindParams) => {
    const isTopLevel = wrapperDepth === 0;
    wrapperDepth += 1;
    try {
      const res = params !== undefined ? origExec(sqlText, params) : origExec(sqlText);
      const upper = sqlText.trimStart().toUpperCase();
      if (isTopLevel && txDepth === 0 && isMutatingSql(upper)) {
        persistDatabaseToDisk();
      }
      return res;
    } finally {
      wrapperDepth -= 1;
    }
  }) as typeof client.exec;

  return client;
}

export const sqlite = instrumentSqlJsPersistence(rawSqlite);

export const db = drizzle(sqlite, { schema });

function ensureProfileColumns(): void {
  const tableInfo = sqlite.exec("PRAGMA table_info('profiles')");
  const existingRows = tableInfo[0]?.values ?? [];
  const names = new Set(existingRows.map((row) => String(row[1])));

  const migrations: Array<[string, string]> = [
    ['age', 'ALTER TABLE profiles ADD COLUMN age INTEGER NOT NULL DEFAULT 38'],
    ['is_verified', 'ALTER TABLE profiles ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 1'],
    [
      'highlight_plan',
      "ALTER TABLE profiles ADD COLUMN highlight_plan TEXT NOT NULL DEFAULT 'free'",
    ],
    [
      'billing_cycle',
      "ALTER TABLE profiles ADD COLUMN billing_cycle TEXT NOT NULL DEFAULT 'monthly'",
    ],
    [
      'pix_key',
      "ALTER TABLE profiles ADD COLUMN pix_key TEXT NOT NULL DEFAULT 'verilar.pagamentos@pix.com.br'",
    ],
    [
      'search_appearances',
      'ALTER TABLE profiles ADD COLUMN search_appearances INTEGER NOT NULL DEFAULT 45',
    ],
    [
      'profile_views',
      'ALTER TABLE profiles ADD COLUMN profile_views INTEGER NOT NULL DEFAULT 19',
    ],
    [
      'chat_requests',
      'ALTER TABLE profiles ADD COLUMN chat_requests INTEGER NOT NULL DEFAULT 6',
    ],
  ];

  for (const [col, sql] of migrations) {
    if (!names.has(col)) {
      sqlite.exec(sql);
    }
  }
}

export function initializeSchemaDDL(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('freelancer', 'employer')),
      title TEXT NOT NULL,
      avatar_initials TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 1,
      freelancer_profile_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_hash TEXT NOT NULL,
      device TEXT NOT NULL,
      browser TEXT NOT NULL,
      ip TEXT NOT NULL,
      location TEXT NOT NULL,
      last_active TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL DEFAULT 38,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      radar_category TEXT NOT NULL,
      bio TEXT NOT NULL,
      city TEXT NOT NULL,
      neighborhood TEXT NOT NULL,
      hourly_rate REAL NOT NULL,
      daily_rate REAL NOT NULL,
      experience_years INTEGER NOT NULL,
      availability TEXT NOT NULL CHECK (availability IN ('online', 'offline', 'urgency')),
      urgency_radius_km REAL NOT NULL DEFAULT 10,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      response_time_minutes INTEGER NOT NULL DEFAULT 20,
      phone_masked TEXT NOT NULL DEFAULT '(11) 98800-****',
      is_verified INTEGER NOT NULL DEFAULT 1,
      highlight_plan TEXT NOT NULL DEFAULT 'free',
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      pix_key TEXT NOT NULL DEFAULT 'verilar.pagamentos@pix.com.br',
      search_appearances INTEGER NOT NULL DEFAULT 45,
      profile_views INTEGER NOT NULL DEFAULT 19,
      chat_requests INTEGER NOT NULL DEFAULT 6,
      completed_contracts_count INTEGER NOT NULL DEFAULT 0,
      public_rating REAL NOT NULL DEFAULT 5.0,
      public_review_count INTEGER NOT NULL DEFAULT 0,
      badges_json TEXT NOT NULL,
      skills_json TEXT NOT NULL,
      certifications_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_profiles_coords ON profiles(lat, lng);
    CREATE INDEX IF NOT EXISTS idx_profiles_availability ON profiles(availability);

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      employer_id TEXT NOT NULL,
      employer_name TEXT NOT NULL,
      freelancer_id TEXT NOT NULL,
      freelancer_name TEXT NOT NULL,
      sender_role TEXT NOT NULL CHECK (sender_role IN ('employer', 'freelancer')),
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      proposed_amount REAL,
      payment_method TEXT,
      payment_status TEXT,
      service_date TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_chat_pair ON chat_messages(employer_id, freelancer_id, created_at);

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      job_title TEXT NOT NULL,
      employer_id TEXT NOT NULL,
      employer_name TEXT NOT NULL,
      freelancer_id TEXT NOT NULL,
      freelancer_name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft', 'pending_signature', 'active', 'completed', 'cancelled')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      agreed_rate REAL NOT NULL,
      rate_type TEXT NOT NULL CHECK (rate_type IN ('hourly', 'daily', 'monthly')),
      weekly_hours INTEGER,
      location_address TEXT NOT NULL,
      clauses_json TEXT NOT NULL,
      security_hash TEXT NOT NULL,
      employer_signed_at TEXT,
      freelancer_signed_at TEXT,
      can_review INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contracts_freelancer ON contracts(freelancer_id, status);
    CREATE INDEX IF NOT EXISTS idx_contracts_employer ON contracts(employer_id, status);

    CREATE TABLE IF NOT EXISTS public_reviews (
      id TEXT PRIMARY KEY,
      contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
      freelancer_id TEXT NOT NULL,
      employer_name TEXT NOT NULL,
      employer_type TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      date TEXT NOT NULL,
      service_category TEXT NOT NULL,
      contract_period TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS secret_evaluations (
      id TEXT PRIMARY KEY,
      contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
      employer_id TEXT NOT NULL,
      freelancer_id TEXT NOT NULL,
      evaluated_at TEXT NOT NULL,
      relationship_duration TEXT NOT NULL,
      honesty_score REAL NOT NULL CHECK (honesty_score >= 1.0 AND honesty_score <= 10.0),
      punctuality_score REAL NOT NULL CHECK (punctuality_score >= 1.0 AND punctuality_score <= 10.0),
      emotional_stability_score REAL NOT NULL CHECK (emotional_stability_score >= 1.0 AND emotional_stability_score <= 10.0),
      discretion_confidentiality_score REAL NOT NULL CHECK (discretion_confidentiality_score >= 1.0 AND discretion_confidentiality_score <= 10.0),
      reaction_under_crisis_score REAL NOT NULL CHECK (reaction_under_crisis_score >= 1.0 AND reaction_under_crisis_score <= 10.0),
      would_rehire_privately INTEGER NOT NULL DEFAULT 1,
      private_notes TEXT NOT NULL,
      has_verified_contract INTEGER NOT NULL DEFAULT 1
    );

    CREATE TRIGGER IF NOT EXISTS trg_secret_eval_requires_completed_contract
    BEFORE INSERT ON secret_evaluations
    FOR EACH ROW
    BEGIN
      SELECT CASE
        WHEN (SELECT status FROM contracts WHERE id = NEW.contract_id) IS NULL THEN
          RAISE(ABORT, 'Vínculo Inválido: Contrato informado não existe.')
        WHEN (SELECT status FROM contracts WHERE id = NEW.contract_id) != 'completed' THEN
          RAISE(ABORT, 'Regra Anti-Difamação: Avaliações exigem atendimento/contrato CONCLUÍDO.')
      END;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_public_review_requires_completed_contract
    BEFORE INSERT ON public_reviews
    FOR EACH ROW
    BEGIN
      SELECT CASE
        WHEN (SELECT status FROM contracts WHERE id = NEW.contract_id) IS NULL THEN
          RAISE(ABORT, 'Vínculo Inválido: Atendimento informado não existe.')
        WHEN (SELECT status FROM contracts WHERE id = NEW.contract_id) != 'completed' THEN
          RAISE(ABORT, 'Avaliações exigem atendimento concluído.')
      END;
    END;

    CREATE TABLE IF NOT EXISTS job_announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      employer_id TEXT NOT NULL,
      employer_name TEXT NOT NULL,
      employer_type TEXT NOT NULL,
      location TEXT NOT NULL,
      distance_km REAL NOT NULL,
      work_schedule TEXT NOT NULL,
      contract_type TEXT NOT NULL,
      rate_description TEXT NOT NULL,
      rate_amount REAL NOT NULL,
      posted_at TEXT NOT NULL,
      status TEXT NOT NULL,
      urgency INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      responsibilities_json TEXT NOT NULL,
      required_badges_json TEXT NOT NULL,
      benefits_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS job_applicants (
      id TEXT PRIMARY KEY,
      announcement_id TEXT NOT NULL REFERENCES job_announcements(id) ON DELETE CASCADE,
      candidate_id TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      candidate_role TEXT NOT NULL,
      avatar_seed TEXT,
      rating REAL NOT NULL,
      review_count INTEGER NOT NULL,
      distance_km REAL NOT NULL,
      salary_expectation REAL NOT NULL,
      stage TEXT NOT NULL CHECK (stage IN ('triagem', 'entrevista', 'proposta', 'contratado')),
      applied_date TEXT NOT NULL,
      badges_json TEXT NOT NULL,
      cover_note TEXT NOT NULL,
      contract_id TEXT,
      confidential_feedback_snippet TEXT
    );

    CREATE TABLE IF NOT EXISTS feed_posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      author_category TEXT NOT NULL,
      avatar_seed TEXT NOT NULL,
      verified_badges_count INTEGER NOT NULL DEFAULT 3,
      created_at TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('certification', 'daily_routine', 'milestone')),
      media_title TEXT,
      media_subtext TEXT,
      likes_count INTEGER NOT NULL DEFAULT 1,
      endorsements_count INTEGER NOT NULL DEFAULT 0,
      has_verified_ex_employer_endorsement INTEGER NOT NULL DEFAULT 0,
      endorsed_by_employer TEXT
    );
  `);

  ensureProfileColumns();
  persistDatabaseToDisk();
}
