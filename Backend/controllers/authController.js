import { User } from "../models/User.js";
import { Profile } from "../models/Profile.js";
import { Candidate } from "../models/Candidate.js";
import { Recruiter } from "../models/Recruiter.js";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { USER_ROLES } from "../config/constants.js";

// Token generation

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.expiresIn,
    },
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_CONFIG.refreshTokenSecret,
    {
      expiresIn: JWT_CONFIG.refreshTokenExpiresIn,
    },
  );

  return { accessToken, refreshToken };
};

// Sig up account for RECRUITER AND CANDIDATE

export const signUp = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role } = req.validatedData;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role,
  });

  // Auto-create Profile and role-specific record so the user can apply/post jobs immediately
  const profile = await Profile.create({
    user_id: user.id,
    role,
  });

  if (role === USER_ROLES.CANDIDATE) {
    await Candidate.create({
      user_id: user.id,
      profile_id: profile.id,
    });
  } else if (role === USER_ROLES.RECRUITER) {
    await Recruiter.create({
      profile_id: profile.id,
    });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  res.status(201).json({
    message: "User created successfully",
    user: user.toJSON(),
    accessToken,
    refreshToken,
  });
});

// Sign in existing account

export const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedData;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  await user.update({ lastLogin: new Date() });

  const { accessToken, refreshToken } = generateTokens(user);

  res.status(200).json({
    message: "Sign in successful",
    user: user.toJSON(),
    accessToken,
    refreshToken,
  });
});

// Refresh tokens when access token expires

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_CONFIG.refreshTokenSecret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// Logout user (for token-based auth, this is mostly handled client-side)

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});