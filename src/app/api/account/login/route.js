import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function POST(req) {
  let connection;
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return Response.json({ error: "Username and password are required", code: "INVALID_INPUT" }, { status: 400 });
    }

    // Connect to database
    connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT id, username, pass, roll, access FROM employees WHERE username = ?",
      [username]
    );
    await connection.end(); // Close connection after query

    if (rows.length === 0) {
      return Response.json({ error: "Invalid username or password", code: "AUTH_FAILED" , status: 401 }, { status: 200 });
    }

    const user = rows[0];

    // Check if the user is active
    // == ===
    if (user.access === 0) {
      return Response.json({ error: "Account is disabled", code: "ACCOUNT_DISABLED" , status: 403}, { status: 200 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.pass);
    if (!passwordMatch) {
      return Response.json({ error: "Invalid username or password", code: "AUTH_FAILED" , status: 401}, { status: 200 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.roll },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return Response.json({ message: "Login successful", token, code: "SUCCESS" }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error.code || "UNKNOWN", error.message);
    return Response.json(
      { error: `Server error: ${error.message}`, code: error.code || "SERVER_ERROR" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("DB Close Error:", closeError.code, closeError.message);
      }
    }
  }
}
