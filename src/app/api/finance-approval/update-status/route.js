// app/api/finance-approval/update-status/route.js
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
        JSON.stringify({ error: "Invalid action. Must be 'approve' or 'reject'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const loanType = loanId.charAt(0); // 'A' for auto loans, 'B' for business loans
    const id = loanId.substring(2); // Extract the numeric ID
    const status = action === "approve" ? "active" : "rejected";

    const connection = await connectDB();

    try {
      await connection.beginTransaction();

      let contractId = null;
      let transferType = loanType === "A" ? "Auto Loan" : "Business Loan";

      if (loanType === "A") {
        const [loanResult] = await connection.execute(
          `SELECT contractid FROM auto_loan_applications WHERE id = ?`,
          [id]
        );

        if (loanResult.length === 0) {
          throw new Error("Auto loan not found");
        }

        contractId = loanResult[0].contractid || `CT-${4590 + parseInt(id)}`;
        await connection.execute(
          `UPDATE auto_loan_applications SET status = ?, comment = ? WHERE id = ?`,
          [status, comment || "", id]
        );
      } else if (loanType === "B") {
        const [loanResult] = await connection.execute(
          `SELECT contractid FROM loan_bussiness WHERE id = ?`,
          [id]
        );

        if (loanResult.length === 0) {
          throw new Error("Business loan not found");
        }

        contractId = loanResult[0].contractid || `CT-${4590 + parseInt(id)}`;
        await connection.execute(
          `UPDATE loan_bussiness SET status = ? WHERE id = ?`,
          [status, id]
        );
      } else {
        throw new Error("Invalid loan type");
      }

      const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
      const transferId = `TRF-${Date.now().toString().slice(-6)}`;

      // Check if 'comment' column exists in fintransfer table
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM fintransfer LIKE 'comment'`
      );

      // Construct the SQL statement based on column existence
      let sql, params;
      
      if (columns.length > 0) {
        // If 'comment' column exists
        sql = `INSERT INTO fintransfer 
          (Contractid, Suppervicer, Transferid, TransferType, Status, comment, Addat, Editat)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        params = [
          contractId,
          1, // Assuming supervisor ID 1
          transferId,
          transferType,
          status,
          comment || "",
          currentDate,
          currentDate,
        ];
      } else {
        // If 'comment' column doesn't exist
        sql = `INSERT INTO fintransfer 
          (Contractid, Suppervicer, Transferid, TransferType, Status, Addat, Editat)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
        params = [
          contractId,
          1, // Assuming supervisor ID 1
          transferId,
          transferType,
          status,
          currentDate,
          currentDate,
        ];
      }

      await connection.execute(sql, params);
      await connection.commit();

      return new Response(
        JSON.stringify({
          success: true,
          message: `Funding ${action === "approve" ? "approved" : "rejected"} successfully`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      await connection.rollback();
      console.error("Error in finance approval:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error in finance approval API:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
