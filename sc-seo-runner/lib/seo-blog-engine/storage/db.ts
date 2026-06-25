import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

/**
 * Get or create database connection pool
 */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err: Error) => {
      console.error('[v0] Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Execute a query on the database
 */
export async function query(
  text: string,
  params?: unknown[]
): Promise<QueryResult> {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
