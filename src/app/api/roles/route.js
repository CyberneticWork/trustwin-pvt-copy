import { connectDB } from "@/lib/db";

export const GET = async () => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT * FROM roles"
    );

    return new Response(JSON.stringify({ code: "SUCCESS", data: rows }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(
      JSON.stringify({ code: "ERROR", message: "Failed to fetch admins" }),
      { status: 500 }
    );
  }
};
