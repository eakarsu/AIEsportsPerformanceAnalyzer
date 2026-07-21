'use strict';

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool(process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('Explicit bootstrap acknowledgement is required');
  }
  const email = (process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || '';
  const name = (process.env.PROVISION_ADMIN_NAME || '').trim();
  if (!email || !name || password.length < 12) {
    throw new Error('Admin email, name, and a 12+ character password are required');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       name = EXCLUDED.name,
       role = EXCLUDED.role`,
    [email, passwordHash, name]
  );
  console.log('Administrator provisioned.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
