import { connectDB } from "@/lib/db";

// API Endpoint: /api/loan/installment/transactions
// Fetch all payment transactions for a contractid from loan_payments
export async function POST(req) {
  let connection;
  try {
    const body = await req.json();
    const { contractid } = body;
    if (!contractid) {
      return new Response(
        JSON.stringify({ code: "ERROR", message: "contractid is required" }),
        { status: 400 }
      );
    }
    connection = await connectDB();
    // Get all payments for this contract, ordered by payment_date and id
    const [rows] = await connection.execute(
      `SELECT id, contractid, payment_number, payment_date, amount_paid, payment_method, transaction_id, status, notes, setalment, addby, created_at
       FROM loan_payments WHERE contractid = ? ORDER BY payment_date DESC, id DESC`,
      [contractid]
    );
    await connection.end();
    return new Response(
      JSON.stringify({
        code: "SUCCESS",
        message: "Transactions loaded successfully",
        data: rows
      }),
      { status: 200 }
    );
  } catch (error) {
    if (connection) await connection.end();
    return new Response(
      JSON.stringify({ code: "ERROR", message: error.message }),
      { status: 500 }
    );
  }
}
