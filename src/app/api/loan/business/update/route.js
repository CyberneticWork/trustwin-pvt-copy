import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log(data);
    console.log("Updating loan business details:", data);

    const {
      loanId,
      residentType,
      utilityBillType
    } = data;

    if (!loanId || !residentType || !utilityBillType) {
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "loanId, residentType, and utilityBillType are required"
        }),
        { status: 400 }
      );
    }

    const connection = await connectDB();

    try {
      // Update the loan business table
      const [result] = await connection.execute(
        `UPDATE loan_bussiness SET 
          residenttype = ?,
          billtype = ?
        WHERE id = ?`,
        [residentType, utilityBillType, loanId]
      );

      if (result.affectedRows === 0) {
        return new Response(
          JSON.stringify({
            code: "ERROR",
            message: "No loan business record found with the provided ID"
          }),
          { status: 404 }
        );
      }

      return new Response(
        JSON.stringify({
          code: "SUCCESS",
          message: "Loan business details updated successfully"
        }),
        { status: 200 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error updating loan business details:", error);
    return new Response(
      JSON.stringify({
        code: "ERROR",
        message: error.message
      }),
      { status: 500 }
    );
  }
}
