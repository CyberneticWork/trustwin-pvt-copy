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

    // Format loan ID
    const locationCode = customerData.customer.location.substring(0, 2).toUpperCase();
    const productCode = loanType.substring(0, 2).toUpperCase();
    const periodCode = periodType === "Weeks" ? "W" : 
                      periodType === "Monthly" ? "M" : 
                      periodType === "Daily" ? "D" : "Y";
    const formattedLoanId = `${locationCode}${productCode}${periodCode}${String(loanId).padStart(5, '0')}`;

    // Update loan_bussiness table
    const connection = await connectDB();
    
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
