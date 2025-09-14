import postgres from 'postgres';

// Use your direct connection string
const connectionString = process.env.DATABASE_URL;

const sql = postgres(connectionString, {
  // Optional: configure connection pool
  max: 10, // maximum number of connections
  idle_timeout: 30, // seconds
  connect_timeout: 30, // seconds
});

export default sql;