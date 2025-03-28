// src/pages/api/account/validate.js
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      code: "SUCCESS",
      username: decoded.username,
      role: decoded.role,
    });
  } catch (error) {
    res.status(401).json({ code: "ERROR", error: "Invalid token" });
  }
}