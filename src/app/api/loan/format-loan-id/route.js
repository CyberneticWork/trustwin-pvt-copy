import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { customerId, loanType, loanId, periodType } = await req.json();

    if (!customerId || !loanType || !loanId || !periodType) {
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "customerId, loanType, loanId, and periodType are required"
        }),
        { status: 400 }
      );
    }

    // Get customer location
    const customerResponse = await fetch(`http://localhost:3000/api/customer/searchbyid?clid=${customerId}`);
    const customerData = await customerResponse.json();
    
    if (customerData.code !== "SUCCESS" || !customerData.customer || !customerData.customer.location) {
      throw new Error("Failed to get customer details or location not found");
    }

    // Get loan business details
    const businessResponse = await fetch(`http://localhost:3000/api/loan/business/details?id=${loanId}`);
    const businessData = await businessResponse.json();
    
    if (!businessData.success) {
      throw new Error("Failed to get business details");
    }

    const connection = await connectDB();
    
    // Get CRO ID, loan type, and employee details from loan_business and employees tables
    const [loanBusiness] = await connection.execute(
      `SELECT lb.CROid, lb.type, lb.term, e.branchID 
       FROM loan_bussiness lb
       JOIN employees e ON lb.CROid = e.id 
       WHERE lb.id = ?`,
      [parseInt(loanId, 10)]
    );

    if (loanBusiness.length === 0) {
      throw new Error('Loan business record not found');
    }

    const branchId = loanBusiness[0].branchID;
    
    // Get branch shortcode
    const [branches] = await connection.execute(
      'SELECT shortcode FROM branches WHERE id = ?',
      [branchId]
    );

    if (branches.length === 0) {
      throw new Error('Branch not found for the employee');
    }

    const branchCode = branches[0].shortcode;
    
    // Determine frequency code from term
    const term = loanBusiness[0].term.toLowerCase();
    let frequencyCode = 'M'; // Default to Monthly
    
    if (term.includes('day') || term === 'daily') {
      frequencyCode = 'D';
    } else if (term.includes('week') || term === 'weekly') {
      frequencyCode = 'W';
    } else if (term.includes('year') || term === 'annually') {
      frequencyCode = 'A';
    }

    // Format contract ID: branchCode + 'BL' + frequencyCode + loan_id
    const formattedLoanId = `${branchCode}BL${frequencyCode}${loanId}`;
    
    // Update loan_bussiness table with the new contract ID
    await connection.execute(
      `UPDATE loan_bussiness SET contractid = ? WHERE id = ?`,
      [formattedLoanId, parseInt(loanId, 10)]
    );

    return new Response(
      JSON.stringify({
        code: "SUCCESS",
        message: "Loan ID formatted and updated successfully",
        formattedLoanId: formattedLoanId
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error formatting loan ID:", error);
    return new Response(
      JSON.stringify({
        code: "ERROR",
        message: error.message
      }),
      { status: 500 }
    );
  }
}
