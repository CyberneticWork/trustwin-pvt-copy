// API Endpoint: /api/loan/installment/transactions_full
// Fetch all payment transactions for a contractid from loan_payments (returns all rows, no filter)

import { connectDB } from "@/lib/db";

export async function GET(req) {
  let connection;
  try {
    // Optionally, allow contractid as a query param, but default is all
    const { searchParams } = new URL(req.url);
    const contractid = searchParams.get("contractid");
    connection = await connectDB();
    let rows;
    if (contractid) {
      [rows] = await connection.execute(
        `SELECT id, contractid, payment_number, payment_date, amount_paid, payment_method, transaction_id, status, notes, setalment, addby, created_at FROM loan_payments WHERE contractid = ? ORDER BY payment_date DESC, id DESC`,
        [contractid]
      );
    } else {
      [rows] = await connection.execute(
        `SELECT id, contractid, payment_number, payment_date, amount_paid, payment_method, transaction_id, status, notes, setalment, addby, created_at FROM loan_payments ORDER BY payment_date DESC, id DESC`
      );
    }
    await connection.end();
    return new Response(
      JSON.stringify({ code: "SUCCESS", message: "All transactions loaded successfully", data: rows }),
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
