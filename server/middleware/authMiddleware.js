import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    let token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Нет доступа, токен отсутствует" });
    }

    // Проверка токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Недействительный токен" });
  }
};