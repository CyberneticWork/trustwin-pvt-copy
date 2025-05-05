import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { customerId, loanId, bankData } = await req.json();

    if (!customerId || !loanId || !bankData) {
      return Response.json({
        code: "ERROR",
        message: "Missing required fields"
      }, { status: 400 });
    }

    console.log("Bank data:", bankData);

    const connection = await connectDB();

    // Check if bank details already exist for this customer and loan
    const [existing] = await connection.execute(
      `SELECT id FROM bankdetails 
       WHERE customerid = ? AND loandid = ?`,
      [customerId, loanId]
    );

    if (existing.length > 0) {
      // Update existing record
      const [updateResult] = await connection.execute(
        `UPDATE bankdetails 
         SET acctype = ?, bank = ?, acno = ?, branch = ?, 
             period = ?, Turnover1 = ?, Turnover2 = ?, Turnover3 = ?
         WHERE customerid = ? AND loandid = ?`,
        [
          bankData.acctype,
          bankData.bank,
          bankData.acno,
          bankData.branch,
          bankData.period,
          bankData.month1,
          bankData.month2,
          bankData.month3,
          customerId,
          loanId
        ]
      );

      if (updateResult.affectedRows === 0) {
        return Response.json({
          code: "ERROR",
          message: "Failed to update bank details"
        }, { status: 404 });
      }
    } else {
      // Insert new record
      const [insertResult] = await connection.execute(
        `INSERT INTO bankdetails 
         (customerid, loandid, acctype, bank, acno, branch, 
          period, Turnover1, Turnover2, Turnover3) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          loanId,
          bankData.accountType,
          bankData.bankName,
          bankData.accountNumber,
          bankData.branchName,
          bankData.bankAccountPeriod,
          bankData.bankTurnover.month1 || 0,
          bankData.bankTurnover.month2 || 0,
          bankData.bankTurnover.month3 || 0
        ]
      );
    }

    return Response.json({
      code: "SUCCESS",
      message: "Bank details saved successfully"
    });

  } catch (error) {
    console.error("Error saving bank details:", error);
    return Response.json({
      code: "ERROR",
      message: "Failed to save bank details"
    }, { status: 500 });
  }
}
