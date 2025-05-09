// app/api/finance-approval/fix-status/route.js
import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    // Create database connection
    const connection = await connectDB();
    
    try {
      await connection.beginTransaction();
      
      // Fix auto loan statuses (trim and convert to expected format)
      const [autoUpdateResult] = await connection.execute(`
        UPDATE auto_loan_applications 
        SET status = 'fund waiting'
        WHERE LOWER(TRIM(status)) IN ('fund waiting', 'fundwaiting', 'fund_waiting', 'waiting for fund', 'fund-waiting')
        AND status != 'fund waiting'
      `);
      
      // Fix equipment loan statuses
      const [equipUpdateResult] = await connection.execute(`
        UPDATE equipment_loan_applications 
        SET status = 'fund waiting'
        WHERE LOWER(TRIM(status)) IN ('fund waiting', 'fundwaiting', 'fund_waiting', 'waiting for fund', 'fund-waiting')
        AND status != 'fund waiting'
      `);
      
      // Fix business loan statuses
      const [businessUpdateResult] = await connection.execute(`
        UPDATE loan_bussiness 
        SET status = 'fund waiting'
        WHERE LOWER(TRIM(status)) IN ('fund waiting', 'fundwaiting', 'fund_waiting', 'waiting for fund', 'fund-waiting')
        AND status != 'fund waiting'
      `);
      
      await connection.commit();
      
      // Return results
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            autoLoansUpdated: autoUpdateResult.affectedRows,
            equipmentLoansUpdated: equipUpdateResult.affectedRows,
            businessLoansUpdated: businessUpdateResult.affectedRows
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error fixing statuses:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
