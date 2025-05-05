import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { id, residenceType, utilityBillType } = await req.json();

    if (!id || !residenceType || !utilityBillType) {
      return Response.json({
        code: "ERROR",
        message: "Missing required fields"
      }, { status: 400 });
    }

    const connection = await connectDB();

    // Update the loan application with residence and bill type
    const [result] = await connection.execute(
      `UPDATE auto_loan_applications 
       SET residenttype = ?, billtype = ?
       WHERE id = ?`,
      [residenceType, utilityBillType, id]
    );

    if (result.affectedRows === 0) {
      return Response.json({
        code: "ERROR",
        message: "Loan application not found"
      }, { status: 404 });
    }

    return Response.json({
      code: "SUCCESS",
      message: "Loan application updated successfully"
    });

  } catch (error) {
    console.error("Error updating loan application:", error);
    return Response.json({
      code: "ERROR",
      message: "Failed to update loan application"
    }, { status: 500 });
  }
}
