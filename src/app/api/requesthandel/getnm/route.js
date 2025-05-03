// app/api/requesthandel/loadnamechange/route.js
import { connectDB } from "@/lib/db";

export const GET = async () => {
  try {
    const db = await connectDB();

    // Step 1: Fetch pending customer updates
    const [pendingCustomerRows] = await db.execute(
      "SELECT * FROM update_customer WHERE status = 'Pending' ORDER BY id DESC"
    );

    // Step 2: Fetch approved customer details
    const customerIDs = pendingCustomerRows.map((row) => row.id);
    const customerNICs = pendingCustomerRows.map((row) => row.nic);

    let approvedCustomerRows = [];
    if (customerNICs.length > 0) {
      const [result] = await db.execute(
        `SELECT * FROM customer WHERE nic IN (${customerNICs.map(() => "?").join(",")})`,
        customerNICs
      );
      approvedCustomerRows = result;
    }

    
    console.log("Approved Customer Rows:", approvedCustomerRows);
    console.log("Customer IDs:", customerIDs);

    // Step 3: Fetch pending spouse updates
    let pendingSpouseRows = [];
    if (customerIDs.length > 0) {
      const [result] = await db.execute(
        `SELECT * FROM update_spouse WHERE customers IN (${customerIDs.map(() => "?").join(",")})`,
        customerIDs
      );
      pendingSpouseRows = result;
    }

    const spouseIDs = approvedCustomerRows.map((row) => row.id);
    console.log("Spouse IDs:", spouseIDs);

    // Step 4: Fetch approved spouse details
    let approvedSpouseRows = [];
    if (spouseIDs.length > 0) {
      const [result] = await db.execute(
        `SELECT * FROM spouse WHERE customers IN (${spouseIDs.map(() => "?").join(",")})`,
        spouseIDs
      );
      approvedSpouseRows = result;
    }

    console.log("Approved Spouse Rows:", approvedSpouseRows);
    // Log approved spouse rows for debugging


    // Step 5: Combine all data into a single response
    const combinedData = pendingCustomerRows.map((pendingCustomer) => {
      const approvedCustomer = approvedCustomerRows.find(
        (cust) => cust.nic === pendingCustomer.nic
      );
      
      // Convert IDs to strings for proper comparison
      const pendingSpouse = pendingSpouseRows.find(
        (spouse) => spouse.customers.toString() === pendingCustomer.id.toString()
      );
      
      // Match approved spouse using approved customer's ID
      const approvedSpouse = approvedSpouseRows.find(
        (spouse) => spouse.customers.toString() === approvedCustomer.id.toString()
      );

      // Log currentSpouseData for debugging
      if (!approvedSpouse) {
        console.warn(`No approved spouse data found for customer ID: ${pendingCustomer.id}`);
      }

      return {
        id: pendingCustomer.id,
        nic: pendingCustomer.nic,
        currentCustomerData: approvedCustomer || null,
        pendingCustomerData: pendingCustomer || null,
        currentSpouseData: approvedSpouse || null,
        pendingSpouseData: pendingSpouse || null,
        status: pendingCustomer.status,
        requestedBy: pendingCustomer.createby,
        requestedAt: pendingCustomer.createat,
      };
    });

    // Return the combined data
    return new Response(
      JSON.stringify({ code: "SUCCESS", data: combinedData }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching request data:", error);
    return new Response(
      JSON.stringify({
        code: "ERROR",
        message: "Failed to fetch request data",
      }),
      { status: 500 }
    );
  }
};