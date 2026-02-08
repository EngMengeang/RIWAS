import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User} from "../models/User.js";
dotenv.config();

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader)
    return res.status(401).json({ error: "Authorization header missing" })

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Fetch the full Sequelize user instance
    const user = await User.findByPk(decoded.id)
    if (!user) return res.status(404).json({ error: "User not found" })

    // req.user = user 
    req.user = { id: user.id, role: user.role, email: user.email }
    next()
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" })
  }
}

// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     console.log("ALLOWED ROLES:", roles)
//     console.log("USER ROLE:", req.user?.role)
//     next()
//   }
// }
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ error: "Unauthorized" });

    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden: Access denied" });

    next();
  };
};