import { connectDB } from "@/lib/db";

export async function POST(request) {
  const { loanId } = await request.json();
  let connection;

  try {
    if (!loanId) {
      return Response.json(
        { code: "ERROR", message: "Loan ID is required" },
        { status: 400 }
      );
    }

    connection = await connectDB();

    // Get CRO ID and branch ID from auto_loan_applications and employees tables
    const [loanData] = await connection.execute(
      `SELECT ala.id, ala.CROid, e.branchID 
       FROM auto_loan_applications ala
       JOIN employees e ON ala.CROid = e.id 
       WHERE ala.id = ?`,
      [parseInt(loanId, 10)]
    );

    if (loanData.length === 0) {
      throw new Error('Auto loan application not found');
    }

    const branchId = loanData[0].branchID;
    
    // Get branch shortcode
    const [branches] = await connection.execute(
      'SELECT shortcode FROM branches WHERE id = ?',
      [branchId]
    );

    if (branches.length === 0) {
      throw new Error('Branch not found');
    }

    const branchCode = branches[0].shortcode;

    // Format contract ID: branchCode + 'MB' + 'HP' + 5-digit loan ID
    const formattedLoanId = `${branchCode}MBHP${String(loanId).padStart(5, '0')}`;
    
    // Update auto_loan_applications table with the new contract ID
    await connection.execute(
      `UPDATE auto_loan_applications SET contractid = ? WHERE id = ?`,
      [formattedLoanId, parseInt(loanId, 10)]
    );

    return Response.json({
      code: "SUCCESS",
      data: { contractId: formattedLoanId }
    });
  } catch (error) {
    console.error("Error formatting loan ID:", error);
    return Response.json(
      { code: "ERROR", message: error.message || "Failed to format loan ID" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
}
