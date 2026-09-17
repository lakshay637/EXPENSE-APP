import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. Authentication token missing." });
    }

    const secret = process.env.AUTH_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token. Please log in again." });
  }
};
