const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
const register = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const allowedRoles = ["USER", "ORGANIZER"];
  const userRole =
    role && allowedRoles.includes(role.toUpperCase())
      ? role.toUpperCase()
      : "USER";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, password: hashed, role: userRole },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  const token = signToken(user.id);
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.status(201).json({ user });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user.id);
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  return res.status(200).json({ message: "Logged out" });
};

// GET /api/auth/me
const me = (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = { register, login, logout, me };
