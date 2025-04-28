import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

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

export async function GET(req) {
  let connection;
  try {
    connection = await connectDB();

    // Parse query params for filter and query
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');
    const query = searchParams.get('query');

    console.log('[API] /api/customer/list filter:', filter, 'query:', query);

    let clients = [];
    if (filter && query) {
      let sql = 'SELECT id, fullname, nic, gender, location, district, address, telno FROM customer WHERE ';
      let params = [];
      switch (filter) {
        case 'name':
          sql += 'fullname LIKE ?';
          params.push(`%${query}%`);
          break;
        case 'nic':
          sql += 'nic LIKE ?';
          params.push(`%${query}%`);
          break;
        case 'id':
          sql += 'id = ?';
          params.push(query);
          break;
        case 'telno':
          sql += 'telno LIKE ?';
          params.push(`%${query}%`);
          break;
        default:
          return NextResponse.json({ error: 'Unknown filter' }, { status: 400 });
      }
      console.log('[API] SQL:', sql, 'PARAMS:', params);
      [clients] = await connection.execute(sql, params);
    } else {
      // Don't return all clients by default
      return NextResponse.json([]);
    }

    // Get all loans with valid status (only approved, success, finished)
    const [loans] = await connection.execute(
      `SELECT customerid, status FROM loan WHERE status IN (1,2,3)`
    );

    // Calculate activeLoans for each client
    const loanMap = {};
    loans.forEach(l => {
      loanMap[l.customerid] = (loanMap[l.customerid] || 0) + 1;
    });

    const enrichedClients = clients.map(c => ({
      ...c,
      activeLoans: loanMap[c.id] || 0
    }));

    return NextResponse.json(enrichedClients);
  } catch (err) {
    console.error('[API] Error loading clients:', err);
    return NextResponse.json({ error: "Failed to load clients", error: err }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
