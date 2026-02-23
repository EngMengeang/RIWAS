export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  const status = err.status || 500
  const message = err.message || "Internal Server Error"

  res.status(status).json({
    error: message,
    timestamp: new Date(),
    path: req.path,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

