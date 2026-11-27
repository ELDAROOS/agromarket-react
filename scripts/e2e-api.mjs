import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const backend = new URL('../../agromarket-server/', import.meta.url);
const requireBackend = createRequire(new URL('package.json', backend));
const { parse } = requireBackend('dotenv');
const { Pool } = requireBackend('pg');
const bcrypt = requireBackend('bcryptjs');
let settings = {};
try { settings = parse(readFileSync(new URL('.env', backend))); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const connectionString = process.env.E2E_DATABASE_URL || settings.DATABASE_URL;
if (!connectionString || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(connectionString).hostname)) {
  throw new Error('Для E2E задайте E2E_DATABASE_URL с локальной PostgreSQL или локальный DATABASE_URL в ../agromarket-server/.env');
}
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.CORS_ORIGINS = 'http://127.0.0.1:5174';
const schema = `lab12_e2e_${randomBytes(8).toString('hex')}`;
const admin = new Pool({ connectionString });
const database = new Pool({ connectionString, options: `-c search_path=${schema}` });
let server;
let stopping = false;
let schemaCreated = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (server) await new Promise((resolve) => server.close(resolve));
  await database.end();
  if (schemaCreated) await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await admin.end();
}
try {
  await admin.query(`CREATE SCHEMA ${schema}`);
  schemaCreated = true;
  await database.query(readFileSync(new URL('db/schema.sql', backend), 'utf8'));
  await database.query(readFileSync(new URL('db/migrations/013_orders.sql', backend), 'utf8'));
  const { products } = JSON.parse(readFileSync(new URL('data/db.json', backend), 'utf8'));
  for (const product of products) {
    await database.query('INSERT INTO products (name, category, price, unit, image, stock) VALUES ($1,$2,$3,$4,$5,20)',
      [product.name, product.category, product.price, product.unit || 'кг', product.image]);
  }
  const hash = await bcrypt.hash(process.env.E2E_FARMER_PASSWORD, 10);
  await database.query("INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,'admin')",
    ['E2E Администратор', process.env.E2E_FARMER_EMAIL, hash]);
  const { createApp } = await import(new URL('app.js', backend));
  server = createApp({ database }).listen(3100, '127.0.0.1', () => console.log('E2E API: временная схема PostgreSQL готова'));
  server.on('error', async (error) => { console.error(error.message); await stop(); process.exit(1); });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await stop(); process.exit(0); });
} catch (error) {
  console.error(error.message);
  await stop();
  process.exitCode = 1;
}
