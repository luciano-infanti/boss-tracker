const { Client } = require('pg');

const connectionString = "postgres://postgres.fzovndomokzocesykxmi:QuN86khZCUT75HwD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupSchema() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Bosses Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bosses (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        total_days_spawned INTEGER DEFAULT 0,
        total_kills INTEGER DEFAULT 0,
        spawn_frequency TEXT,
        next_expected_spawn TEXT,
        last_kill_date TEXT,
        history TEXT,
        stats JSONB
      );
    `);
    console.log('Created bosses table');

    // Characters Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS characters (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        world TEXT,
        vocation TEXT,
        level INTEGER,
        link TEXT,
        last_updated TEXT,
        stats JSONB
      );
    `);
    console.log('Created characters table');

    // Character History Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS character_history (
        id SERIAL PRIMARY KEY,
        character_name TEXT REFERENCES characters(name) ON DELETE CASCADE,
        date TEXT NOT NULL,
        level INTEGER,
        experience BIGINT,
        daily_raw BIGINT,
        stats JSONB,
        UNIQUE(character_name, date)
      );
    `);
    console.log('Created character_history table');

    // Kill History Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS kill_history (
        id SERIAL PRIMARY KEY,
        boss_name TEXT REFERENCES bosses(name) ON DELETE CASCADE,
        world TEXT,
        date TEXT,
        count INTEGER,
        UNIQUE(boss_name, world, date)
      );
    `);
    console.log('Created kill_history table');

    // Metadata Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value JSONB
      );
    `);
    console.log('Created metadata table');

  } catch (err) {
    console.error('Error setting up schema:', err);
  } finally {
    await client.end();
  }
}

setupSchema();
