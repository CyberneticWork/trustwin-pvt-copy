import { connectDB } from "@/lib/db";

export const GET = async () => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      `SELECT id, name, empid FROM employees WHERE roll = 'CRO' AND access = 1`
    );

    return new Response(JSON.stringify({ code: "SUCCESS", data: rows }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching CRO officers:", error);
    return new Response(
      JSON.stringify({ code: "ERROR", message: "Failed to fetch CRO officers" }),
      { status: 500 }
    );
  }
};
