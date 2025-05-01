import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { id } = await request.json();
    const newPassword = "Password@123";

    // Get database connection
    const connection = await connectDB();

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update admin password
    const [result] = await connection.execute(
      `UPDATE employees SET pass = ? WHERE id = ?`,
      [hashedPassword, id]
    );

    await connection.end();

    if (result.affectedRows > 0) {
      return new Response(
        JSON.stringify({ code: "SUCCESS", message: "Password reset successfully" }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ code: "ERROR", message: "Failed to reset password" }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return new Response(
      JSON.stringify({ code: "ERROR", message: error.message }),
      { status: 500 }
    );
  }
}
