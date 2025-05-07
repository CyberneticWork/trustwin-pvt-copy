// app/api/loan-approval/statistics/route.js
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const connection = await connectDB();
    
    try {
      // Get auto loan statistics
      const [autoStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' OR status = 'fund waiting' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'pending' OR status = 'under the review' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM auto_loan_applications
      `);
      
      // Get business loan statistics
      const [businessStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' OR status = 'fund waiting' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'pending' OR status = 'under the review' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM loan_bussiness
      `);
      
      // Calculate combined stats
      const totalLoans = Number(autoStats[0].total) + Number(businessStats[0].total);
      const activeLoans = Number(autoStats[0].active) + Number(businessStats[0].active);
      const pendingLoans = Number(autoStats[0].pending) + Number(businessStats[0].pending);
      const rejectedLoans = Number(autoStats[0].rejected) + Number(businessStats[0].rejected);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            total: totalLoans,
            active: activeLoans,
            pending: pendingLoans,
            rejected: rejectedLoans,
            autoLoans: {
              total: Number(autoStats[0].total),
              active: Number(autoStats[0].active),
              pending: Number(autoStats[0].pending),
              rejected: Number(autoStats[0].rejected)
            },
            businessLoans: {
              total: Number(businessStats[0].total),
              active: Number(businessStats[0].active),
              pending: Number(businessStats[0].pending),
              rejected: Number(businessStats[0].rejected)
            }
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error fetching loan statistics:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
