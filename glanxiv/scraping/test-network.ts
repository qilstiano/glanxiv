import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
});

async function test() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("Connected! Time:", result[0].now);
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await sql.end();
  }
}

test();
