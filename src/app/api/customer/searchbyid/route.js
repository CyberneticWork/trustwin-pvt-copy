import { connectDB } from "@/lib/db";

export async function GET(req) {
  let connection;
  try {
    // Get clid from query params
    const { searchParams } = new URL(req.url);
    const clid = searchParams.get('clid');
    console.log(clid);
    
    if (!clid) {
      return Response.json({ error: "Client ID is required", code: "INVALID_INPUT" }, { status: 400 });
    }
    connection = await connectDB();
    // Fetch ALL fields of customer by client id
    const [custRows] = await connection.execute("SELECT * FROM customer WHERE id = ?", [clid]);
    if (custRows.length === 0) {
      await connection.end();
      return Response.json({ error: "Customer not found", code: "NOT_FOUND" }, { status: 404 });
    }
    const customer = custRows[0];
    await connection.end();
    // Return all fields of the customer table
    return Response.json({ customer, code: "SUCCESS" }, { status: 200 });
  } catch (error) {
    if (connection) try { await connection.end(); } catch (e) {}
    console.error("Customer GET API Error (searchbyid):", error);
    return Response.json({ error: error.message, code: error.code || "SERVER_ERROR" }, { status: 500 });
  }
}
