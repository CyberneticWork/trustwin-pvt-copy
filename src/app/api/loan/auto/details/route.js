import { connectDB } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const loanId = searchParams.get('id');

    if (!loanId) {
      return Response.json({
        code: "ERROR",
        message: "Loan ID is required"
      }, { status: 400 });
    }

    const connection = await connectDB();

    // First get the loan details to get the customer_id
    const [loan] = await connection.execute(
      `SELECT * FROM auto_loan_applications WHERE id = ?`,
      [loanId]
    );

    if (loan.length === 0) {
      return Response.json({
        code: "ERROR",
        message: "Auto loan not found"
      }, { status: 404 });
    }

    const customerId = loan[0].customer_id;

    // Get customer details
    const [customer] = await connection.execute(
      `SELECT id, fullname, prefix, nic, gender, dob, location, telno, address, 
              gs, ds, district, province, status, createby, createat, editby, editat 
       FROM customer 
       WHERE id = ?`,
      [customerId]
    );

    if (customer.length === 0) {
      return Response.json({
        code: "ERROR",
        message: "Customer not found"
      }, { status: 404 });
    }

    // Get auto loan details with customer name
    const [loanWithCustomer] = await connection.execute(
      `SELECT a.*, c.fullname as customer_name 
       FROM auto_loan_applications a 
       JOIN customer c ON a.customer_id = c.id 
       WHERE a.id = ?`,
      [loanId]
    );

    if (loan.length === 0) {
      return Response.json({
        code: "ERROR",
        message: "Auto loan not found"
      }, { status: 404 });
    }

    // Format customer ID
    const formattedCustomerId = `CLN-${String(customer[0].id).padStart(3, '0')}`;

    // Parse payment schedule from JSON
    const paymentSchedule = JSON.parse(loan[0].payment_schedule);

    return Response.json({
      code: "SUCCESS",
      data: {
        customer: {
          ...customer[0],
          CusDisId: formattedCustomerId
        },
        loan: {
          ...loan[0],
          payment_schedule: paymentSchedule
        }
      }
    });

  } catch (error) {
    console.error("Error fetching auto loan details:", error);
    return Response.json({
      code: "ERROR",
      message: "Failed to fetch auto loan details"
    }, { status: 500 });
  }
}
