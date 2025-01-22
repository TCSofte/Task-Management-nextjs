import { Pool } from "pg";

const pool = new Pool({
  user: "tiziano",
  host: "85.235.148.171",
  database: "task_db_0200",
  password: "AppiusTest2025!",
  port: 8432,
});

export const query = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  return res.rows;
};
