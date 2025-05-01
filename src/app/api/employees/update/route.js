import { connectDB } from '@/lib/db';

export async function POST(request) {
  try {
    const { id, ...data } = await request.json();

    // Get database connection
    const connection = await connectDB();

    // Update admin details
    const updateFields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    const [result] = await connection.execute(
      `UPDATE employees SET ${updateFields} WHERE id = ?`,
      [...values, id]
    );

    await connection.end();

    if (result.affectedRows > 0) {
      return new Response(
        JSON.stringify({ code: "SUCCESS", message: "Admin updated successfully" }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ code: "ERROR", message: "Failed to update admin" }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating admin:", error);
    return new Response(
      JSON.stringify({ code: "ERROR", message: error.message }),
      { status: 500 }
    );
  }
}
