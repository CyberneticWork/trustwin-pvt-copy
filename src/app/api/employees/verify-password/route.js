import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { id, password } = await request.json();
    const connection = await connectDB();

    // Get the current admin's hashed password from the database
    const [result] = await connection.execute(
      `SELECT pass FROM employees WHERE id = ?`,
      [id]
    );

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ code: "ERROR", message: "Admin not found" }),
        { status: 404 }
      );
    }

    const hashedPassword = result[0].pass;
    
    // Verify the provided password against the hashed password
    const isMatch = await bcrypt.compare(password, hashedPassword);

    await connection.end();

    if (isMatch) {
      return new Response(
        JSON.stringify({ code: "SUCCESS", message: "Password verified successfully" }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ code: "ERROR", message: "Incorrect password" }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    return new Response(
      JSON.stringify({ code: "ERROR", message: error.message }),
      { status: 500 }
    );
  }
}
