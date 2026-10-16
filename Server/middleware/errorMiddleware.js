function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === "MulterError") {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ message: err.message });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate record" });
  }

  console.error(err);
  res.status(err.status || 500).json({
    message: err.status && err.status < 500 ? err.message : "Server error",
  });
}

module.exports = { errorMiddleware };
