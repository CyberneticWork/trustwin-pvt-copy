import { connectDB } from "@/lib/db";

export async function GET() {
  let connection;
  try {
    connection = await connectDB();
    
    const [rows] = await connection.execute(
      "SELECT id, branch, shortcode FROM branches"
    );

    return Response.json({
      code: "SUCCESS",
      data: rows
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return Response.json({
      code: "ERROR",
      message: "Failed to fetch branches"
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
}
