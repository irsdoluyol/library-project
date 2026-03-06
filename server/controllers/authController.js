import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Регистрация
export const registerUser = async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    // Валидация
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
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Логин
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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

    res.json({
      message: "Успешный вход",
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
};