import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const { contractid } = await req.json();
    if (!contractid) {
      return NextResponse.json({ code: "ERROR", message: "Missing contractid" }, { status: 400 });
    }
    // DB connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // 1. Try to get last completed payment date
    const [payments] = await connection.execute(
      `SELECT payment_date FROM loan_payments WHERE contractid=? AND status='completed' ORDER BY payment_date DESC LIMIT 1`,
      [contractid]
    );
    let lastPaymentDate = null;
    if (payments.length > 0) {
      lastPaymentDate = payments[0].payment_date;
    } else {
      // 2. Fallback: get updated_at from auto_loan_applications
      const [apps] = await connection.execute(
        `SELECT updated_at FROM auto_loan_applications WHERE contractid=? LIMIT 1`,
        [contractid]
      );
      if (apps.length > 0) {
        lastPaymentDate = apps[0].updated_at;
      }
    }
    if (!lastPaymentDate) {
      await connection.end();
      return NextResponse.json({ code: "NOT_FOUND", message: "No payment or application found for contractid" }, { status: 404 });
    }

    // 3. Calculate arrears days
    const gracePerMonth = 3;
    // Use server time as today
    const today = new Date();
    const lastDate = new Date(lastPaymentDate);
    // Total days difference
    const diffTime = today.getTime() - lastDate.getTime();
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // Calculate number of full months between dates
    let months = (today.getFullYear() - lastDate.getFullYear()) * 12 + (today.getMonth() - lastDate.getMonth());
    // If last payment day is after today in the month, don't count current month
    if (today.getDate() < lastDate.getDate()) months--;
    if (months < 0) months = 0;
    const totalGrace = months * gracePerMonth;
    const arrearsDays = Math.max(0, diffDays - totalGrace);

    await connection.end();
    return NextResponse.json({ code: "SUCCESS", data: { arrearsDays, lastPaymentDate, months, graceDays: totalGrace, totalDays: diffDays } });
  } catch (error) {
    return NextResponse.json({ code: "ERROR", message: error.message }, { status: 500 });
  }
}
