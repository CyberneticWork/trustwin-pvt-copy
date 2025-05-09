// app/api/finance-approval/debug/route.js
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    // Create database connection
    const connection = await connectDB();

    try {
      // Get all statuses to debug
      const [autoStatuses] = await connection.execute(`
        SELECT DISTINCT status FROM auto_loan_applications
      `);
      
      const [equipmentStatuses] = await connection.execute(`
        SELECT DISTINCT status FROM equipment_loan_applications
      `);
      
      const [businessStatuses] = await connection.execute(`
        SELECT DISTINCT status FROM loan_bussiness
      `);

      // Return status values for debugging
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            autoLoanStatuses: autoStatuses,
            equipmentLoanStatuses: equipmentStatuses,
            businessLoanStatuses: businessStatuses
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error fetching debug data:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
