const { Client } = require('pg');

async function setup() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const sql = `
      CREATE TABLE IF NOT EXISTS scraper_logs (
          id SERIAL PRIMARY KEY,
          scraper_name VARCHAR(100),
          records_upserted INT,
          status VARCHAR(50),
          ip_address VARCHAR(50),
          log_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(sql);
    console.log('Table "scraper_logs" created or already exists.');

  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await client.end();
  }
}

setup();
