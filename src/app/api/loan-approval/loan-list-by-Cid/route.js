// app/api/loan-approval/loan-list-by-Cid/route.js
import { connectDB } from "@/lib/db";

export async function GET(request) {
  // Get the customer ID from the URL query parameters
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('id');

  if (!customerId) {
    return new Response(
      JSON.stringify({ error: "Customer ID is required" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Create database connection
    const connection = await connectDB();

    try {
      // Get auto loans for the specific customer
      const [autoLoanResults] = await connection.execute(`
        SELECT 
          a.id,
          c.fullname as customerName,
          a.contractid,
          e.name as croName,
          a.loan_amount as revenueAmount,
          a.status,
          'Auto Loan' as loanType,
          DATE_FORMAT(a.created_at, '%b %d, %Y') as applicationDate
        FROM auto_loan_applications a
        JOIN customer c ON a.customer_id = c.id
        LEFT JOIN employees e ON a.CROid = e.id
        WHERE a.customer_id = ?
        ORDER BY a.created_at DESC
      `, [customerId]);

      // Get business loans for the specific customer
      const [businessLoanResults] = await connection.execute(`
        SELECT 
          b.id,
          c.fullname as customerName,
          b.contractid,
          e.name as croName,
          b.loanAmount as revenueAmount,
          b.status,
          b.type as loanType,
          DATE_FORMAT(b.addat, '%b %d, %Y') as applicationDate
        FROM loan_bussiness b
        JOIN customer c ON b.customerid = c.id
        LEFT JOIN employees e ON b.CROid = e.id
        WHERE b.customerid = ?
        ORDER BY b.addat DESC
      `, [customerId]);

      // Get equipment loans for the specific customer
      const [equipmentLoanResults] = await connection.execute(`
          SELECT 
      p.id,
      c.fullname AS customerName,
      p.contractid,
      e.name AS croName,
      p.loan_amount AS revenueAmount,
      p.status,
      DATE_FORMAT(p.created_at, '%b %d, %Y') AS applicationDate
      FROM equipment_loan_applications p
      JOIN customer c ON p.customer_id = c.id
      LEFT JOIN employees e ON p.CROid = e.id
       WHERE p.customer_id = ?
      ORDER BY p.created_at DESC
      `, [customerId]);
      console.log(equipmentLoanResults);
      // Format auto loans
      const formattedAutoLoans = autoLoanResults.map(loan => ({
        id: `A-${loan.id}`,
        customerName: loan.customerName,
        contractId: loan.contractid || `CT-${4590 + parseInt(loan.id)}`,
        croName: loan.croName || "Unassigned",
        revenueAmount: `LKR ${Number(loan.revenueAmount).toLocaleString()}`,
        status: loan.status === "fund waiting" ? "Waiting for Funds" :
          loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
        loanType: "Auto Loan",
        applicationDate: loan.applicationDate
      }));
      // Format Equipment Loans
      const formattedEquipmentLoans = equipmentLoanResults.map(loan => ({
        id: `E-${loan.id}`,
        customerName: loan.customerName,
        contractId: loan.contractid || `CT-${4590 + parseInt(loan.id)}`,
        croName: loan.croName || "Unassigned",
        revenueAmount: `LKR ${Number(loan.revenueAmount).toLocaleString()}`,
        status: loan.status === "fund waiting" ? "Waiting for Funds" :
          loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
        loanType: "Equipment Loan",
        applicationDate: loan.applicationDate
      }));
      // Format business loans
      const formattedBusinessLoans = businessLoanResults.map(loan => ({
        id: `E-${loan.id}`,
        customerName: loan.customerName,
        contractId: loan.contractid || `CT-${4590 + parseInt(loan.id)}`,
        croName: loan.croName || "Unassigned",
        revenueAmount: `LKR ${Number(loan.revenueAmount).toLocaleString()}`,
        status: loan.status === "fund waiting" ? "Waiting for Funds" :
          loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
        loanType: loan.loanType === "daily" ? "Business (Daily)" : "Business (Monthly)",
        applicationDate: loan.applicationDate
      }));

      // Combine all loan types
      const allLoans = [...formattedAutoLoans, ...formattedBusinessLoans, ...formattedEquipmentLoans];

      // Sort by most recent date
      allLoans.sort((a, b) => {
        const dateA = new Date(a.applicationDate);
        const dateB = new Date(b.applicationDate);
        return dateB - dateA;
      });

      // Also fetch customer basic information
      const [customerInfo] = await connection.execute(`
        SELECT 
          id,
          fullname as clientName,
          id as clientId
        FROM customer
        WHERE id = ?
      `, [customerId]);

      const customerData = customerInfo.length > 0 ? {
        clientName: customerInfo[0].clientName,
        clientId: `C-${customerInfo[0].clientId}`,
        loans: allLoans
      } : null;

      return new Response(
        JSON.stringify({
          success: true,
          data: customerData || { clientName: "Customer not found", clientId: "", loans: [] }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  } catch (error) {
    console.error("Error fetching customer loans:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
