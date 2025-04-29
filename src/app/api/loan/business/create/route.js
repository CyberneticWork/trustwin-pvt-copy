import { connectDB } from "@/lib/db"; // Ensure this matches your database connection utility

export const POST = async (req) => {
  try {
    console.log("Incoming POST request to /api/loan/business/create");

    const body = await req.json(); // Parse the JSON body
    console.log("Parsed Request Body:", body); // Log the parsed request body

    const {
      customerid,
      CROid,
      Addby,
      type,
      loanAmount,
      rate,
      term,
      initialPay,
      initialPayType,
      IssueAmmount,
      Installment,
      Totalpay,
      ratetearm,
    } = body;

    // Adjusted validation logic to allow `0` values
    if (
      customerid == null ||
      CROid == null ||
      Addby == null ||
      !type ||
      loanAmount == null ||
      rate == null ||
      !term ||
      initialPay == null ||
      !initialPayType ||
      IssueAmmount == null ||
      Installment == null ||
      Totalpay == null ||
      !ratetearm
    ) {
      console.error("Validation Error: Missing required fields", body);
      return new Response(JSON.stringify({ message: "All fields are required" }), {
        status: 400,
      });
    }

    console.log("Connecting to the database...");
    const db = await connectDB(); // Establish database connection
    console.log("Database connection established.");

    console.log("Executing SQL query...");
    const [result] = await db.execute(
      `INSERT INTO loan_bussiness 
      (customerid, CROid, Addby, type, loanAmount, rate, term, initialPay, initialPayType, IssueAmmount, Installment, Totalpay, ratetearm, addat,status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),"pending")`,
      [
        customerid,
        CROid,
        Addby,
        type,
        loanAmount,
        rate,
        term,
        initialPay,
        initialPayType,
        IssueAmmount,
        Installment,
        Totalpay,
        ratetearm,
      ]
    );

    console.log("SQL query executed successfully. Insert ID:", result.insertId);

    return new Response(
      JSON.stringify({ message: "Loan saved successfully", id: result.insertId }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred while processing the request:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error", error: error.message }),
      { status: 500 }
    );
  }
};
