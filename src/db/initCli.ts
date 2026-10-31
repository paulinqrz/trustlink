import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, '..', '..', '.env');

if (fs.existsSync(envFilePath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envFilePath);
  } catch {
    // Segue com defaults caso o .env tenha formatação inválida
  }
}

const { getDatabaseFilePath, initializeSchemaDDL } = await import('./index.ts');
const { seedDatabaseIfEmpty } = await import('./seed.ts');

initializeSchemaDDL();
seedDatabaseIfEmpty();

const dbPath = getDatabaseFilePath();
if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
  const sizeKb = (fs.statSync(dbPath).size / 1024).toFixed(1);
  console.log(`[Verilar] Arquivo SQLite gravado com sucesso: ${dbPath} (${sizeKb} KB)`);
} else {
  console.log(`[Verilar] Banco inicializado em: ${dbPath}`);
}
