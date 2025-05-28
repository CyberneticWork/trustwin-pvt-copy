import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { customerId, loanId, supplierData } = await req.json();

    if (!customerId || !loanId || !supplierData) {
      return Response.json({
        code: "ERROR",
        message: "Missing required fields"
      }, { status: 400 });
    }

    console.log("Supplier data:", supplierData);

    const connection = await connectDB();

    // Check if supplier details already exist for this loan
    const [existing] = await connection.execute(
      `SELECT id FROM supplier_details 
       WHERE loanid = ?`,
      [loanId]
    );

    if (existing.length > 0) {
      // Update existing record
      const [updateResult] = await connection.execute(
        `UPDATE supplier_details 
         SET name = ?, br_number = ?, id_number = ?, 
             account_number = ?, bank_name = ?, branch_name = ?
         WHERE loanid = ?`,
        [
          supplierData.name,
          supplierData.brNumber,
          supplierData.idNumber,
          supplierData.accountNumber,
          supplierData.bankName,
          supplierData.branchName,
          loanId
        ]
      );

      if (updateResult.affectedRows === 0) {
        return Response.json({
          code: "ERROR",
          message: "Failed to update supplier details"
        }, { status: 404 });
      }

      return Response.json({
        code: "SUCCESS",
        message: "Supplier details updated successfully"
      });
    } else {
      // Insert new record
      const [insertResult] = await connection.execute(
        `INSERT INTO supplier_details (
          loanid, name, br_number, id_number,
          account_number, bank_name, branch_name
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?)`,
        [
          loanId,
          supplierData.name,
          supplierData.brNumber,
          supplierData.idNumber,
          supplierData.accountNumber,
          supplierData.bankName,
          supplierData.branchName
        ]
      );

      if (insertResult.affectedRows === 0) {
        return Response.json({
          code: "ERROR",
          message: "Failed to insert supplier details"
        }, { status: 500 });
      }

      return Response.json({
        code: "SUCCESS",
        message: "Supplier details saved successfully",
        data: { id: supplierData.idNumber }
      });
    }
  } catch (error) {
    console.error("Error saving supplier details:", error);
    return Response.json({
      code: "ERROR",
      message: "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}
