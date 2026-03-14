import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const registerUser = async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    const trimmedName = name?.trim();
    const trimmedSurname = surname?.trim();
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({ message: "Имя должно быть не менее 2 символов" });
    }
    if (trimmedName.length > 50) {
      return res.status(400).json({ message: "Имя не более 50 символов" });
    }
    if (trimmedSurname && trimmedSurname.length > 50) {
      return res.status(400).json({ message: "Фамилия не более 50 символов" });
    }
    if (!trimmedEmail) {
      return res.status(400).json({ message: "Введите email" });
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: "Некорректный формат email" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Пароль не менее 6 символов" });
    }
    if (password.length > 100) {
      return res.status(400).json({ message: "Пароль не более 100 символов" });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким email уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: trimmedName,
      surname: trimmedSurname || undefined,
      email: trimmedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({
      message: "Пользователь создан",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[register] Ошибка:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNormalized = email?.trim().toLowerCase();
    if (!emailNormalized) {
      return res.status(400).json({ message: "Введите email" });
    }

    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({
      message: "Успешный вход",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[login] Ошибка:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.json({ user: null });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.json({ user: null });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[getMe] Ошибка:", error.message);
    return res.json({ user: null });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Выход выполнен" });
};