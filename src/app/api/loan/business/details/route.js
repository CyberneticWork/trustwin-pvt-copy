import { connectDB } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('id');

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "Business ID is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const connection = await connectDB();

    try {
      // Get loan business details
      const [loanResult] = await connection.execute(
        `SELECT * FROM loan_bussiness WHERE id = ?`,
        [businessId]
      );

      if (loanResult.length === 0) {
        return new Response(
          JSON.stringify({ error: "Business loan not found" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const loanDetails = loanResult[0];

      // Get customer details
      const [customerResult] = await connection.execute(
        `SELECT * FROM customer WHERE id = ?`,
        [loanDetails.customerid]
      );

      if (customerResult.length === 0) {
        return new Response(
          JSON.stringify({ error: "Customer not found" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const customerDetails = customerResult[0];

      // Format the response
      const response = {
        success: true,
        data: {
          loan: {
            id: loanDetails.id,
            type: loanDetails.type,
            amount: loanDetails.loanAmount,
            rate: loanDetails.rate,
            term: loanDetails.term,
            initialPayment: loanDetails.initialPay,
            initialPaymentType: loanDetails.initialPayType,
            issueAmount: loanDetails.IssueAmmount,
            installment: loanDetails.Installment,
            totalPay: loanDetails.Totalpay,
            rateTerm: loanDetails.ratetearm,
            residentType: loanDetails.residenttype,
            billType: loanDetails.billtype,
            status: loanDetails.status,
            addAt: loanDetails.addat
          },
          customer: {
            id: customerDetails.id,
            clientId: `CLN-${customerDetails.id.toString().padStart(3, '0')}`,
            fullName: customerDetails.fullname,
            prefix: customerDetails.prefix,
            nic: customerDetails.nic,
            gender: customerDetails.gender,
            dob: customerDetails.dob,
            location: customerDetails.location,
            telNo: customerDetails.telno,
            address: customerDetails.address,
            gs: customerDetails.gs,
            ds: customerDetails.ds,
            district: customerDetails.district,
            province: customerDetails.province,
            status: customerDetails.status,
            createBy: customerDetails.createby,
            createAt: customerDetails.createat,
            editBy: customerDetails.editby,
            editAt: customerDetails.editat
          }
        }
      };

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error fetching business loan details:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
