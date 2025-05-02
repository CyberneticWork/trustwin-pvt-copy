import { connectDB } from "@/lib/db";

export const POST = async (request) => {
  try {
    const { adminId } = await request.json();
    
    if (!adminId) {
      return new Response(
        JSON.stringify({ code: "ERROR", message: "Admin ID is required" }),
        { status: 400 }
      );
    }

    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT * FROM employees WHERE id = ?",
      [parseInt(adminId)]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ code: "ERROR", message: "Admin not found" }),
        { status: 404 }
      );
    }

    const admin = rows[0];
    const decodedPermissions = Buffer.from(admin.ACL, 'base64').toString();
    
    return new Response(
      JSON.stringify({
        code: "SUCCESS",
        data: {
          ...admin,
          permissions: decodedPermissions.split(',').map(Number)
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return new Response(
      JSON.stringify({ code: "ERROR", message: "Failed to fetch admin data" }),
      { status: 500 }
    );
  }
};
