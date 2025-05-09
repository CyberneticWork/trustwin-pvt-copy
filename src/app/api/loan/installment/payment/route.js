// API Endpoint: /api/loan/installment/payment
// Inserts a new payment record into loan_payments

import { connectDB } from "@/lib/db";

export async function POST(req) {
  let connection;
  try {
    const body = await req.json();
    const {
      contractid,
      payment_number,
      payment_date,
      amount_paid,
      payment_method,
      transaction_id,
      status,
      notes,
      CRO,
      setalment
    } = body;

    // Basic validation
    if (!contractid || !payment_date || !amount_paid || !payment_method || !status) {
      return new Response(
        JSON.stringify({ code: "ERROR", message: "Missing required payment fields" }),
        { status: 400 }
      );
    }

    connection = await connectDB();
    const [result] = await connection.execute(
      `INSERT INTO loan_payments 
        (contractid, payment_number, payment_date, amount_paid, payment_method, transaction_id, status, notes, setalment,addby)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        contractid,
        payment_number || 1, // Default to 1 if not provided
        payment_date,
        amount_paid,
        payment_method,
        transaction_id || null,
        status,
        notes || null,
        setalment || 0,
        CRO
      ]
    );
    await connection.end();
    return new Response(
      JSON.stringify({ code: "SUCCESS", id: result.insertId }),
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
