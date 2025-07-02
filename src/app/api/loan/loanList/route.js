//Get all loan details where status  = 'active'
import { connectDB } from "@/lib/db";

export async function GET(request) {
  // Get the loan type filter from URL query parameters
  const { searchParams } = new URL(request.url);
  const filterType = searchParams.get("type")?.toLowerCase(); // 'all', 'auto', 'business', 'equipment'

  try {
    const connection = await connectDB();

    try {
      let allLoans = [];

      // Get auto loans if type is 'all' or 'auto'
      if (!filterType || filterType === "all" || filterType === "auto") {
        const [autoLoanResults] = await connection.execute(`
          SELECT 
            a.id,
            c.fullname as customerName,
            c.id as customer_id,
            a.contractid,
            e.name as croName,
            a.loan_amount as revenueAmount,
            a.status,
            'Auto Loan' as loanType,
            DATE_FORMAT(a.created_at, '%b %d, %Y') as applicationDate
          FROM auto_loan_applications a
          JOIN customer c ON a.customer_id = c.id
          LEFT JOIN employees e ON a.CROid = e.id
          WHERE a.status = 'active'
          ORDER BY a.created_at DESC
        `);

        const formattedAutoLoans = autoLoanResults.map((loan) => ({
          id: `A-${loan.id}`,
          customerName: loan.customerName,
          customerId: loan.customer_id,
          contractId: loan.contractid || `CT-${4590 + parseInt(loan.id)}`,
          croName: loan.croName || "Unassigned",
          revenueAmount: `LKR ${Number(loan.revenueAmount).toLocaleString()}`,
          status:
            loan.status === "fund waiting"
              ? "Waiting for Funds"
              : loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
          loanType: "Auto Loan",
          applicationDate: loan.applicationDate,
        }));

        allLoans = [...allLoans, ...formattedAutoLoans];
      }

      // Get business loans if type is 'all' or 'business'
      if (!filterType || filterType === "all" || filterType === "business") {
        const [businessLoanResults] = await connection.execute(`
          SELECT 
            b.id,
            c.fullname as customerName,
            c.id as customer_id,
            b.contractid,
            e.name as croName,
            b.loanAmount as revenueAmount,
            b.status,
            b.type as loanType,
            DATE_FORMAT(b.addat, '%b %d, %Y') as applicationDate
          FROM loan_bussiness b
          JOIN customer c ON b.customerid = c.id
          LEFT JOIN employees e ON b.CROid = e.id
          WHERE b.status = 'active'
          ORDER BY b.addat DESC
        `);

        const formattedBusinessLoans = businessLoanResults.map((loan) => ({
          id: `B-${loan.id}`,
          customerName: loan.customerName,
          customerId: loan.customer_id,
          contractId: loan.contractid || `CT-${4590 + parseInt(loan.id)}`,
          croName: loan.croName || "Unassigned",
          revenueAmount: `LKR ${Number(loan.revenueAmount).toLocaleString()}`,
          status:
            loan.status === "fund waiting"
              ? "Waiting for Funds"
              : loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
          loanType:
            loan.loanType === "daily"
              ? "Business (Daily)"
              : "Business (Monthly)",
          applicationDate: loan.applicationDate,
        }));

        allLoans = [...allLoans, ...formattedBusinessLoans];
      }

      // Get equipment loans if type is 'all' or 'equipment'
      if (!filterType || filterType === "all" || filterType === "equipment") {
        const [equipmentLoanResults] = await connection.execute(`
          SELECT 
            eq.id,
            c.fullname as customerName,
            c.id as customer_id,
            eq.contractid,
            e.name as croName,
            eq.loan_amount as revenueAmount,
            eq.status,
            'Equipment Loan' as loanType,
            DATE_FORMAT(eq.created_at, '%b %d, %Y') as applicationDate
          FROM equipment_loan_applications eq
          JOIN customer c ON eq.customer_id = c.id
          LEFT JOIN employees e ON eq.CROid = e.id
          WHERE eq.status = 'active'
          ORDER BY eq.created_at DESC
        `);

        const formattedEquipmentLoans = equipmentLoanResults.map((loan) => ({
          id: `E-${loan.id}`,
          customerName: loan.customerName,
          customerId: loan.customer_id,
          contractId: loan.contractid || `CT-${4590 + parseInt(loan.id)}`,
          croName: loan.croName || "Unassigned",
          revenueAmount: `LKR ${Number(loan.revenueAmount).toLocaleString()}`,
          status:
            loan.status === "fund waiting"
              ? "Waiting for Funds"
              : loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
          loanType: "Equipment Loan",
          applicationDate: loan.applicationDate,
        }));

        allLoans = [...allLoans, ...formattedEquipmentLoans];
      }

      // Sort by most recent date
      allLoans.sort(
        (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
      );

      return new Response(
        JSON.stringify({
          success: true,
          data: allLoans,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  } catch (error) {
    console.error("Error fetching loans:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
