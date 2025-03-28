import mysql from "mysql2/promise";

// Load environment variables
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USR ,
  password: process.env.DB_PASS ,
  database: process.env.DB_NAME ,
};

// Function to create MySQL connection
export async function connectDB() {
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    return connection;
  } catch (error) {
    console.error("Database Connection Error:", error.code, error.message);
    throw new Error(`DB_ERROR: ${error.code || "UNKNOWN"} - ${error.message}`);
  }
}
