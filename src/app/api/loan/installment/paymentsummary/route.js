import { connectDB } from "@/lib/db";

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
    // Get all completed payments for this contract
    const [rows] = await connection.execute(
      `SELECT * FROM loan_payments WHERE contractid = ? AND status = 'completed' ORDER BY payment_date DESC, id DESC`,
      [contractid]
    );
    // Total paid
    const totalPaid = rows.reduce((sum, row) => sum + parseFloat(row.amount_paid), 0);
    // Last paid amount
    const lastPaidAmount = rows.length > 0 ? parseFloat(rows[0].amount_paid) : 0;
    // Last payment date
    const lastPaidDate = rows.length > 0 ? rows[0].payment_date : null;
    return new Response(
      JSON.stringify({
        code: "SUCCESS",
        message: "Payment summary loaded successfully",
        data: {
          totalPaid: totalPaid.toFixed(2),
          lastPaidAmount: lastPaidAmount.toFixed(2),
          lastPaidDate
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ code: "ERROR", message: error.message }),
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
