import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from 'crypto';

export async function POST(req) {
  let connection;
  try {
    const body = await req.json();
    let username = body.username;
    let password = body.password;
    let token = body.token;

    connection = await connectDB();

    if (username && password) {
      // Validate login credentials
      const [rows] = await connection.execute(
        "SELECT id, username, pass, roll, access FROM employees WHERE username = ?",
        [username]
      );
      
      if (rows.length === 0) {
        return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 });
      }

      const user = rows[0];
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.pass);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid password", code: "INVALID_PASSWORD" }, { status: 401 });
      }

      // Check if account is enabled
      if (user.access !== 1) {
        return NextResponse.json({ error: "Account is disabled", code: "ACCOUNT_DISABLED" }, { status: 403 });
      }

      // Generate new token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Update user's token in database
      await connection.execute(
        "UPDATE employees SET hash = ? WHERE id = ?",
        [token, user.id]
      );

      return NextResponse.json({ 
        code: "SUCCESS",
        user: {
          id: user.id,
          username: user.username,
          role: user.roll,
          access: user.access
        },
        token: token
      }, { status: 200 });
    } else if (token) {
      // Validate token
      const [tokenRows] = await connection.execute(
        "SELECT username, pass, roll, access, id FROM employees WHERE hash = ?",
        [token]
      );

      if (tokenRows.length === 0) {
        return NextResponse.json({ error: "Invalid token", code: "INVALID_TOKEN" }, { status: 401 });
      }

      const user = tokenRows[0];
      
      // Check if account is enabled
      if (user.access !== 1) {
        return NextResponse.json({ error: "Account is disabled", code: "ACCOUNT_DISABLED" }, { status: 403 });
      }

      return NextResponse.json({ 
        code: "SUCCESS",
        user: {
          id: user.id,
          username: user.username,
          role: user.roll,
          access: user.access
        }
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid request", code: "INVALID_INPUT" }, { status: 400 });
  } catch (error) {
    console.error("Credentials Validation Error:", error);
    return NextResponse.json({
      error: "Server error",
      code: "SERVER_ERROR"
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
}


