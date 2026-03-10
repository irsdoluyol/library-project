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

/** Опциональная аутентификация: без токена — req.user = null, с токеном — расшифровываем. Не отдаёт 401. */
export const optionalProtect = (req, res, next) => {
  try {
    let token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    req.user = null;
    next();
  }
};