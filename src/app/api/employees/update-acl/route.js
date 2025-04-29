import { connectDB } from "@/lib/db";

export async function POST(req) {
  let connection;
  try {
    const data = await req.json();
    const { id, aclBase64 } = data;

    if (!id || !aclBase64) {
      return new Response(
        JSON.stringify({ code: "INVALID_INPUT", message: "Missing id or aclBase64" }),
        { status: 400 }
      );
    }

    connection = await connectDB();

    const [result] = await connection.execute(
      "UPDATE employees SET ACL = ? WHERE id = ?",
      [aclBase64, id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ code: "NOT_FOUND", message: "Employee not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ code: "SUCCESS", message: "ACL updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    if (connection) try { await connection.end(); } catch (e) {}
    console.error("Update ACL API Error:", error);
    return new Response(
      JSON.stringify({ code: "SERVER_ERROR", message: "Internal server error" }),
      { status: 500 }
    );
  }
}
