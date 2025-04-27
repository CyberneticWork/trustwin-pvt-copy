import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// DB config (customize as needed)
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tw_db",
};

// Only count loans with status: approved, success, finished
const VALID_LOAN_STATUSES = [
  'approved', // adjust to your numeric code if needed
  'success',  // adjust to your numeric code if needed
  'finished'  // adjust to your numeric code if needed
];

export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Get all clients
    const [clients] = await connection.execute(
      `SELECT id, fullname, nic, gender, location, district , address FROM customer`
    );

    // Get all loans with valid status (only approved, success, finished)
    const [loans] = await connection.execute(
      `SELECT customerid, status FROM loan WHERE status IN (1,2,3)` // Only count these statuses
    );

    // Calculate activeLoans for each client (some clients may have 0 loans)
    const loanMap = {};
    loans.forEach(l => {
      loanMap[l.customerid] = (loanMap[l.customerid] || 0) + 1;
    });

    // Ensure all clients are shown, even those with 0 loans
    const enrichedClients = clients.map(c => ({
      ...c,
      activeLoans: loanMap[c.id] || 0
    }));

    return NextResponse.json(enrichedClients);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load clients" , error: err}, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
