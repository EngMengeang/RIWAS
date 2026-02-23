export const requestValidator = (req, res, next) => {
  // Validate content-type for POST/PUT requests
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (!req.is("json") && !req.is("multipart/form-data")) {
      return res.status(400).json({
        error: "Content-Type must be application/json or multipart/form-data",
      })
    }
  }

  next()
}
