// API Endpoint: /api/payments/settlement-summary
// TASK: Returns settlement and interest summary for a contract
// - totalSettlement: SUM(setalment) for the contract
// - totalInterest: SUM(amount_paid) - SUM(setalment) for the contract
// Accepts POST with { contractid }
// Returns { totalSettlement, totalInterest }

import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { contractid } = await req.json();
    if (!contractid) {
      return new Response(JSON.stringify({ error: 'Missing contractid' }), { status: 400 });
    }

    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT 
        IFNULL(SUM(setalment),0) AS totalSettlement, 
        IFNULL(SUM(amount_paid),0) - IFNULL(SUM(setalment),0) AS totalInterest
      FROM loan_payments WHERE contractid = ? AND status = 'completed'`,
      [contractid]
    );
    await connection.end();

    return new Response(
      JSON.stringify({
        code: 'SUCCESS',
        data: {
          totalSettlement: rows[0].totalSettlement,
          totalInterest: rows[0].totalInterest,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
