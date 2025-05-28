// app/api/guarantors/details/route.js
import { connectDB } from "@/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Guarantor ID is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create database connection
    const connection = await connectDB();

    try {
      // Get detailed guarantor data
      const [guarantorResults] = await connection.execute(`
        SELECT 
          g.*,
          c.fullname as customerName,
          c.telno as customerTelno,
          c.address as customerAddress,
          c.nic as customerNic,
          COALESCE(lb.contractid, ala.contractid, ela.contractid) as contractid,
          CASE
            WHEN lb.id IS NOT NULL THEN 
              CASE 
                WHEN lb.type = 'daily' THEN 'Business Loan (Daily)'
                ELSE 'Business Loan (Monthly)'
              END
            WHEN ala.id IS NOT NULL THEN 'Auto Loan'
            WHEN ela.id IS NOT NULL THEN 'Equipment Loan'
            ELSE 'Unknown'
          END as loanType,
          COALESCE(lb.loanAmount, ala.loan_amount, ela.loan_amount) as loanAmount,
          COALESCE(lb.status, ala.status, ela.status) as loanStatus,
          COALESCE(
            DATE_FORMAT(lb.addat, '%b %d, %Y'), 
            DATE_FORMAT(ala.created_at, '%b %d, %Y'), 
            DATE_FORMAT(ela.created_at, '%b %d, %Y')
          ) as applicationDate
        FROM guarantor g
        LEFT JOIN customer c ON g.customerid = c.id
        LEFT JOIN loan_bussiness lb ON g.loandid = lb.id
        LEFT JOIN auto_loan_applications ala ON g.loandid = ala.id
        LEFT JOIN equipment_loan_applications ela ON g.loandid = ela.id
        WHERE g.id = ?
      `, [id]);

      if (guarantorResults.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Guarantor not found" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const guarantor = guarantorResults[0];

      // Structure the response with customer and loan details
      const formattedGuarantor = {
        id: guarantor.id,
        customerid: guarantor.customerid,
        loandid: guarantor.loandid,
        name: guarantor.name,
        nic: guarantor.nic,
        gender: guarantor.gender,
        dob: guarantor.dob,
        relation: guarantor.relation,
        address: guarantor.address,
        province: guarantor.province,
        gs: guarantor.gs,
        ds: guarantor.ds,
        district: guarantor.district,
        number: guarantor.number,
        income: guarantor.income,
        type: guarantor.type,
        accountno: guarantor.accountno,
        bankname: guarantor.bankname,
        customer: {
          id: guarantor.customerid,
          name: guarantor.customerName,
          nic: guarantor.customerNic,
          telno: guarantor.customerTelno,
          address: guarantor.customerAddress
        },
        loan: {
          id: guarantor.loandid,
          contractid: guarantor.contractid || `LN-${guarantor.loandid}`,
          type: guarantor.loanType,
          amount: guarantor.loanAmount 
            ? `LKR ${Number(guarantor.loanAmount).toLocaleString()}`
            : 'N/A',
          status: guarantor.loanStatus,
          applicationDate: guarantor.applicationDate || 'N/A'
        }
      };

      return new Response(
        JSON.stringify({ success: true, data: formattedGuarantor }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error fetching guarantor details:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
