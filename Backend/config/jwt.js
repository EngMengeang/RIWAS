export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key",
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
}
