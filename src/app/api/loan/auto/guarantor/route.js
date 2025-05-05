import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { customerId, loanId, guarantorData } = await req.json();

    if (!customerId || !loanId || !guarantorData) {
      return Response.json({
        code: "ERROR",
        message: "Missing required fields"
      }, { status: 400 });
    }

    console.log("Guarantor data:", guarantorData);

    const connection = await connectDB();

    // Check if guarantor details already exist for this customer and loan
    const [existing] = await connection.execute(
      `SELECT id FROM guarantor 
       WHERE customerid = ? AND loandid = ? AND nic = ?`,
      [customerId, loanId, guarantorData.nic]
    );

    if (existing.length > 0) {
      // Update existing record
      const [updateResult] = await connection.execute(
        `UPDATE guarantor 
         SET name = ?, nic = ?, gender = ?, dob = ?, relation = ?,
             address = ?, province = ?, gs = ?, ds = ?, district = ?,
             number = ?, income = ?, type = ?, accountno = ?, bankname = ?
         WHERE customerid = ? AND loandid = ? AND nic = ?`,
        [
          guarantorData.name,
          guarantorData.nic,
          guarantorData.gender === 'Male' ? 1 : 0,
          guarantorData.dateOfBirth,
          guarantorData.relationship,
          guarantorData.address,
          guarantorData.province,
          guarantorData.gsDivision,
          guarantorData.dsOffice,
          guarantorData.district,
          guarantorData.mobile,
          parseFloat(guarantorData.income) || 0,
          guarantorData.employment,
          guarantorData.accountNumber,
          guarantorData.bankName,
          customerId,
          loanId,
          guarantorData.nic
        ]
      );

      if (updateResult.affectedRows === 0) {
        return Response.json({
          code: "ERROR",
          message: "Failed to update guarantor details"
        }, { status: 404 });
      }

      return Response.json({
        code: "SUCCESS",
        message: "Guarantor details updated successfully"
      });
    } else {
      // Insert new record
      const [insertResult] = await connection.execute(
        `INSERT INTO guarantor (
          customerid, loandid, name, nic, gender, dob, relation,
          address, province, gs, ds, district, number, income,
          type, accountno, bankname
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          loanId,
          guarantorData.name,
          guarantorData.nic,
          guarantorData.gender === 'Male' ? 1 : 0,
          guarantorData.dateOfBirth,
          guarantorData.relationship,
          guarantorData.address,
          guarantorData.province,
          guarantorData.gsDivision,
          guarantorData.dsOffice,
          guarantorData.district,
          guarantorData.mobile,
          parseFloat(guarantorData.income) || 0,
          guarantorData.employment,
          guarantorData.accountNumber,
          guarantorData.bankName
        ]
      );

      if (insertResult.affectedRows === 0) {
        return Response.json({
          code: "ERROR",
          message: "Failed to insert guarantor details"
        }, { status: 500 });
      }

      return Response.json({
        code: "SUCCESS",
        message: "Guarantor details saved successfully",
        data: { id: insertResult.insertId }
      });
    }
  } catch (error) {
    console.error("Error saving guarantor details:", error);
    return Response.json({
      code: "ERROR",
      message: "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}
