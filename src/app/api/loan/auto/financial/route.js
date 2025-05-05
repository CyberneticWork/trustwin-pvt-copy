import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { customerId, loanId, financialData } = await req.json();

    if (!customerId || !loanId || !financialData) {
      return NextResponse.json({
        code: "ERROR",
        message: "Missing required fields"
      }, { status: 400 });
    }

    const connection = await connectDB();

    // Check if record exists
    const [existing] = await connection.execute(
      `SELECT id FROM financialdetails WHERE customerid = ? AND loandid = ?`,
      [customerId, loanId]
    );

    // Calculate total income and expenses
    const totalIncome = financialData.Bincume + 
                       financialData.Sincume + 
                       financialData.Oincome + 
                       financialData.Iincome;

    const totalExpence = financialData.Bexpence + 
                        financialData.utilitybill + 
                        financialData.livinexpence + 
                        financialData.exiLopayment + 
                        financialData.exiloanamountMon + 
                        financialData.otherexpe;

    const fields = {
      customerid: customerId,
      loandid: loanId,
      Bincume: financialData.Bincume || 0,
      Sincume: financialData.Sincume || 0,
      Oincome: financialData.Oincome || 0,
      Iincome: financialData.Iincome || 0,
      Totalincome: totalIncome,
      Bexpence: financialData.Bexpence || 0,
      utilitybill: financialData.utilitybill || 0,
      livinexpence: financialData.livinexpence || 0,
      exiLopayment: financialData.exiLopayment || 0,
      exiloanamountMon: financialData.exiloanamountMon || 0,
      otherexpe: financialData.otherexpe || 0,
      totalexpence: totalExpence
    };

    if (existing.length > 0) {
      // Update existing record
      const [updateResult] = await connection.execute(
        `UPDATE financialdetails 
         SET Bincume = ?, Sincume = ?, Oincome = ?, Iincome = ?, 
             Totalincome = ?, Bexpence = ?, utilitybill = ?, 
             livinexpence = ?, exiLopayment = ?, exiloanamountMon = ?, 
             otherexpe = ?, totalexpence = ?
         WHERE customerid = ? AND loandid = ?`,
        [
          fields.Bincume,
          fields.Sincume,
          fields.Oincome,
          fields.Iincome,
          fields.Totalincome,
          fields.Bexpence,
          fields.utilitybill,
          fields.livinexpence,
          fields.exiLopayment,
          fields.exiloanamountMon,
          fields.otherexpe,
          fields.totalexpence,
          customerId,
          loanId
        ]
      );

      if (updateResult.affectedRows === 0) {
        return NextResponse.json({
          code: "ERROR",
          message: "Failed to update financial details"
        }, { status: 404 });
      }
    } else {
      // Insert new record
      const [insertResult] = await connection.execute(
        `INSERT INTO financialdetails 
         (customerid, loandid, Bincume, Sincume, Oincome, Iincome, 
          Totalincome, Bexpence, utilitybill, livinexpence, 
          exiLopayment, exiloanamountMon, otherexpe, totalexpence) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fields.customerid,
          fields.loandid,
          fields.Bincume,
          fields.Sincume,
          fields.Oincome,
          fields.Iincome,
          fields.Totalincome,
          fields.Bexpence,
          fields.utilitybill,
          fields.livinexpence,
          fields.exiLopayment,
          fields.exiloanamountMon,
          fields.otherexpe,
          fields.totalexpence
        ]
      );
    }

    return NextResponse.json({
      code: "SUCCESS",
      message: "Financial details saved successfully"
    });
  } catch (error) {
    console.error('Error saving financial details:', error);
    return NextResponse.json({
      code: "ERROR",
      message: "Failed to save financial details"
    }, { status: 500 });
  }
}
