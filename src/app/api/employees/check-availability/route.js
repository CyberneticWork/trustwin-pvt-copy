import { connectDB } from "@/lib/db";

export async function POST(req) {
  let connection;
  try {
    const body = await req.json();
    const { type, value } = body;

    if (!type || !value) {
      return Response.json({
        code: "ERROR",
        message: "Username and value are required"
      }, { status: 400 });
    }

    connection = await connectDB();

    let query;
    let params;

    if (type === "username") {
      query = "SELECT id FROM employees WHERE username = ?";
      params = [value];
    } else if (type === "empid") {
      query = "SELECT id FROM employees WHERE empid = ?";
      params = [value];
    } else {
      return Response.json({
        code: "ERROR",
        message: "Invalid type. Must be 'username' or 'empid'"
      }, { status: 400 });
    }

    const [rows] = await connection.execute(query, params);

    return Response.json({
      code: "SUCCESS",
      available: rows.length === 0
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return Response.json({
      code: "ERROR",
      message: "Failed to check availability"
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
}
