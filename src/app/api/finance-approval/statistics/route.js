// app/api/finance-approval/statistics/route.js
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const connection = await connectDB();
    
    try {
      // Get auto loan statistics for fund waiting loans
      const [autoStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'fund waiting' THEN 1 ELSE 0 END) as waiting,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM auto_loan_applications
        WHERE status IN ('fund waiting', 'active', 'rejected')
      `);
      
      // Get business loan statistics for fund waiting loans
      const [businessStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'fund waiting' THEN 1 ELSE 0 END) as waiting,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM loan_bussiness
        WHERE status IN ('fund waiting', 'active', 'rejected')
      `);
      
      // Get equipment loan statistics for fund waiting loans
      const [equipmentStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'fund waiting' THEN 1 ELSE 0 END) as waiting,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM equipment_loan_applications
        WHERE status IN ('fund waiting', 'active', 'rejected')
      `);
      
      // Calculate combined stats
      const totalLoans = Number(autoStats[0].total) + Number(businessStats[0].total) + Number(equipmentStats[0].total);
      const waitingLoans = Number(autoStats[0].waiting) + Number(businessStats[0].waiting) + Number(equipmentStats[0].waiting);
      const approvedLoans = Number(autoStats[0].approved) + Number(businessStats[0].approved) + Number(equipmentStats[0].approved);
      const rejectedLoans = Number(autoStats[0].rejected) + Number(businessStats[0].rejected) + Number(equipmentStats[0].rejected);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            total: totalLoans,
            waiting: waitingLoans,
            approved: approvedLoans,
            rejected: rejectedLoans,
            autoLoans: {
              total: Number(autoStats[0].total),
              waiting: Number(autoStats[0].waiting),
              approved: Number(autoStats[0].approved),
              rejected: Number(autoStats[0].rejected)
            },
            businessLoans: {
              total: Number(businessStats[0].total),
              waiting: Number(businessStats[0].waiting),
              approved: Number(businessStats[0].approved),
              rejected: Number(businessStats[0].rejected)
            },
            equipmentLoans: {
              total: Number(equipmentStats[0].total),
              waiting: Number(equipmentStats[0].waiting),
              approved: Number(equipmentStats[0].approved),
              rejected: Number(equipmentStats[0].rejected)
            }
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error fetching finance statistics:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
