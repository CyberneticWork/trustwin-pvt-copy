import { connectDB } from "@/lib/db";

export async function POST(req) {
  let connection;
  try {
    const body = await req.json();
    const { id, access } = body;

    if (!id || typeof access !== 'number') {
      return Response.json({
        code: "ERROR",
        message: "Invalid request parameters"
      }, { status: 400 });
    }

    connection = await connectDB();

    // First check if the employee exists
    const [rows] = await connection.execute(
      "SELECT id FROM employees WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return Response.json({
        code: "ERROR",
        message: "Employee not found"
      }, { status: 404 });
    }

    // Update access status
    await connection.execute(
      "UPDATE employees SET access = ? WHERE id = ?",
      [access, id]
    );

    // Verify the update
    const [updatedRows] = await connection.execute(
      "SELECT access FROM employees WHERE id = ?",
      [id]
    );

    if (updatedRows[0].access !== access) {
      return Response.json({
        code: "ERROR",
        message: "Failed to update access status"
      }, { status: 500 });
    }

    return Response.json({
      code: "SUCCESS",
      message: "Access status updated successfully"
    });
  } catch (error) {
    console.error("Error toggling access:", error);
    return Response.json({
      code: "ERROR",
      message: error.message || "Failed to update access status"
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
}
