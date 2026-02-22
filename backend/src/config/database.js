const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'island_challenge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

let isConnected = false;

const initialize = async () => {
  try {
    await client.connect();
    isConnected = true;
    console.log('Connected to PostgreSQL');
    
    // Run migration
    await runMigrations();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const runMigrations = async () => {
  const migrationPath = path.join(__dirname, '../migrations/init.sql');
  try {
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await client.query(sql);
      console.log('Migrations completed');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

const query = async (text, params) => {
  if (!isConnected) {
    throw new Error('Database not connected');
  }
  try {
    return await client.query(text, params);
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

const disconnect = async () => {
  if (isConnected) {
    await client.end();
    isConnected = false;
    console.log('Disconnected from PostgreSQL');
  }
};

module.exports = {
  initialize,
  query,
  disconnect,
  client
};
