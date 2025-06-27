// app/api/loan-approval/update-status/route.js
import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const requestData = await req.json();
    const { loanId, action, comment } = requestData;

    if (!loanId || !action) {
      return new Response(
        JSON.stringify({ error: "Loan ID and action are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({
          error: "Invalid action. Must be 'approve' or 'reject'",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract loan type and ID
    const loanType = loanId.charAt(0);
    const id = loanId.substring(2);

    // Changed: Use 'fund waiting' status instead of 'active' when approving
    const status = action === "approve" ? "fund waiting" : "rejected";

    const connection = await connectDB();

    try {
      // Update the appropriate table based on the loan type
      if (loanType === "A") {
        // Auto loan
        await connection.execute(
          `UPDATE auto_loan_applications SET status = ?, comment = ? WHERE id = ?`,
          [status, comment, id]
        );
      } else if (loanType === "B") {
        // Business loan
        await connection.execute(
          `UPDATE loan_bussiness SET status = ?, comment = ? WHERE id = ?`,
          [status, comment, id]
        );
      } else if (loanType === "E") {
        // Equipment loan
        await connection.execute(
          `UPDATE equipment_loan_applications SET status = ?, comment = ? WHERE id = ?`,
          [status, comment, id]
        );
      } else {
        return new Response(JSON.stringify({ error: "Invalid loan type" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Loan ${
            action === "approve" ? "approved" : "rejected"
          } successfully`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error(`Error updating loan status:`, error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
