// app/api/guarantors/route.js
import { connectDB } from "@/lib/db";

export async function GET(request) {
  const url = new URL(request.url);
  const searchType = url.searchParams.get('type');
  const searchValue = url.searchParams.get('value');
  
  try {
    // Create database connection
    const connection = await connectDB();

    try {
      let query = `
        SELECT 
          g.id,
          g.customerid,
          g.loandid,
          g.name,
          g.nic,
          g.gender,
          g.dob,
          g.relation,
          g.address,
          g.province,
          g.gs,
          g.ds, 
          g.district,
          g.number,
          g.income,
          g.type,
          g.accountno,
          g.bankname,
          c.fullname as customerName,
          COALESCE(lb.contractid, ala.contractid, ela.contractid) as contractid
        FROM guarantor g
        LEFT JOIN customer c ON g.customerid = c.id
        LEFT JOIN loan_bussiness lb ON g.loandid = lb.id
        LEFT JOIN auto_loan_applications ala ON g.loandid = ala.id
        LEFT JOIN equipment_loan_applications ela ON g.loandid = ela.id
      `;

      let params = [];
      
      // Apply search filters if provided
      if (searchType && searchValue) {
        switch (searchType) {
          case 'clientid':
            query += ` WHERE g.customerid = ?`;
            params = [searchValue];
            break;
          case 'loanid':
            query += ` WHERE g.loandid = ? OR lb.contractid LIKE ? OR ala.contractid LIKE ? OR ela.contractid LIKE ?`;
            params = [searchValue, `%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`];
            break;
          case 'nic':
            query += ` WHERE g.nic LIKE ?`;
            params = [`%${searchValue}%`];
            break;
          case 'mobile':
            query += ` WHERE g.number LIKE ?`;
            params = [`%${searchValue}%`];
            break;
        }
      }
      
      query += ` ORDER BY g.id DESC`;
      
      // Execute query
      const [guarantorsResults] = await connection.execute(query, params);

      // Format guarantor data
      const formattedGuarantors = guarantorsResults.map(guarantor => ({
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
        customerName: guarantor.customerName || "Unknown",
        contractid: guarantor.contractid || `LN-${guarantor.loandid}`
      }));

      // Calculate statistics
      const stats = {
        total: formattedGuarantors.length,
        byClientID: searchType === 'clientid' ? formattedGuarantors.length : 0,
        byLoanID: searchType === 'loanid' ? formattedGuarantors.length : 0,
        byNIC: searchType === 'nic' ? formattedGuarantors.length : 0,
        byMobile: searchType === 'mobile' ? formattedGuarantors.length : 0,
      };

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: formattedGuarantors,
          stats
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error fetching guarantor data:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
