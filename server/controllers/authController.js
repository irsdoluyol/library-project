import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PendingRegistration from "../models/PendingRegistration.js";
import { effectiveAccountStatus } from "../utils/accountStatus.js";
import { buildClientVerifyUrl, sendVerificationEmail } from "../utils/mail.js";

const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const crossOrigin =
    process.env.COOKIE_CROSS_ORIGIN === "true" || process.env.COOKIE_CROSS_ORIGIN === "1";
  const sameSite = crossOrigin ? "none" : isProd ? "strict" : "lax";
  const secure = sameSite === "none" || isProd;
  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

const COOKIE_OPTIONS = buildAuthCookieOptions();

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
      console.log(
        `[register] отклонено: email уже в базе (${trimmedEmail}) — письмо не отправлялось. Удалите пользователя в MongoDB или используйте другой email.`
      );
      return res.status(400).json({ message: "Пользователь с таким email уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);

    let pending = await PendingRegistration.findOne({ email: trimmedEmail });
    if (pending) {
      pending.name = trimmedName;
      pending.surname = trimmedSurname || undefined;
      pending.password = hashedPassword;
      pending.token = token;
      pending.expiresAt = expiresAt;
      pending.visibleToModerator = true;
      await pending.save();
    } else {
      await PendingRegistration.create({
        name: trimmedName,
        surname: trimmedSurname || undefined,
        email: trimmedEmail,
        password: hashedPassword,
        token,
        expiresAt,
        visibleToModerator: false,
      });
    }

    const verifyUrl = buildClientVerifyUrl(token);
    const mailResult = await sendVerificationEmail({ to: trimmedEmail, verifyUrl });
    const isDev = process.env.NODE_ENV !== "production";

    let message =
      "На ваш email отправлена ссылка для подтверждения. Перейдите по ней — после этого можно войти.";
    if (mailResult.skipped) {
      message = isDev
        ? "Заявка сохранена (пользователь появится в каталоге после подтверждения). Письма нет: в server/.env не заданы SMTP_HOST / SMTP_USER. Ссылка в консоли сервера и ниже (только для разработки)."
        : "Заявка сохранена. Отправка почты на сервере не настроена — обратитесь к администратору или дождитесь ручного подтверждения.";
    } else if (!mailResult.sent && mailResult.error) {
      message =
        "Заявка сохранена, но письмо не ушло (ошибка SMTP). Проверьте пароль и настройки в server/.env. Попробуйте «Отправить ссылку снова» на странице подтверждения.";
    }

    res.status(201).json({
      message,
      emailSent: Boolean(mailResult.sent),
      registrationPending: true,
      email: trimmedEmail,
      ...(isDev && !mailResult.sent && verifyUrl ? { devVerificationUrl: verifyUrl } : {}),
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
      const pending = await PendingRegistration.findOne({ email: emailNormalized }).select(
        "+password"
      );
      if (pending) {
        const pendingMatch = await bcrypt.compare(password, pending.password);
        if (pendingMatch) {
          return res.status(403).json({
            message:
              "Сначала подтвердите email — перейдите по ссылке из письма. Можно запросить письмо повторно на странице подтверждения.",
          });
        }
      }
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const status = effectiveAccountStatus(user);
    if (status === "pending") {
      return res.status(403).json({
        message:
          "Сначала подтвердите email — перейдите по ссылке из письма. Можно запросить письмо повторно на странице подтверждения.",
      });
    }
    if (status === "rejected") {
      return res.status(403).json({
        message: "Регистрация отклонена администратором. Обратитесь в поддержку.",
      });
    }

    await User.updateOne(
      { _id: user._id },
      { $unset: { emailVerificationToken: "", emailVerificationExpires: "" } }
    );

    setAuthCookie(res, user);
    res.json({
      message: "Успешный вход",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        accountStatus: status,
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
        accountStatus: effectiveAccountStatus(user),
      },
    });
  } catch (error) {
    console.error("[getMe] Ошибка:", error.message);
    return res.json({ user: null });
  }
};

function setAuthCookie(res, user) {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, COOKIE_OPTIONS);
}

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    path: COOKIE_OPTIONS.path,
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
  });
  res.json({ message: "Выход выполнен" });
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const raw = token?.trim();
    if (!raw || typeof token !== "string") {
      return res.status(400).json({ message: "Укажите код из ссылки" });
    }

    const existingWithToken = await User.findOne({ emailVerificationToken: raw }).select(
      "+emailVerificationToken"
    );
    if (existingWithToken && effectiveAccountStatus(existingWithToken) === "active") {
      const exp = existingWithToken.emailVerificationExpires;
      if (exp && exp <= new Date()) {
        return res.status(400).json({
          message: "Ссылка недействительна или срок действия истёк. Запросите новое письмо.",
        });
      }
      setAuthCookie(res, existingWithToken);
      return res.json({
        message: "Email подтверждён.",
        user: {
          id: existingWithToken._id,
          name: existingWithToken.name,
          surname: existingWithToken.surname,
          email: existingWithToken.email,
          role: existingWithToken.role,
          accountStatus: effectiveAccountStatus(existingWithToken),
        },
      });
    }

    const pending = await PendingRegistration.findOneAndDelete({
      token: raw,
      expiresAt: { $gt: new Date() },
    }).select("+password");

    if (pending) {
      const taken = await User.findOne({ email: pending.email });
      if (taken) {
        return res.status(400).json({
          message: "Этот email уже зарегистрирован. Войдите или используйте восстановление доступа.",
        });
      }

      let user;
      try {
        user = await User.create({
          name: pending.name,
          surname: pending.surname || undefined,
          email: pending.email,
          password: pending.password,
          role: "user",
          accountStatus: "active",
          emailVerificationToken: raw,
          emailVerificationExpires: new Date(Date.now() + VERIFY_TTL_MS),
        });
      } catch (err) {
        if (err?.code === 11000 && err?.keyPattern?.email) {
          user = await User.findOne({ email: pending.email });
          if (!user) throw err;
        } else {
          throw err;
        }
      }

      setAuthCookie(res, user);

      return res.json({
        message: "Email подтверждён.",
        user: {
          id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.role,
          accountStatus: effectiveAccountStatus(user),
        },
      });
    }

    const user = await User.findOne({
      emailVerificationToken: raw,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken");

    if (!user) {
      return res.status(400).json({
        message: "Ссылка недействительна или срок действия истёк. Запросите новое письмо.",
      });
    }

    const status = effectiveAccountStatus(user);
    if (status === "rejected") {
      return res.status(403).json({ message: "Регистрация отклонена. Обратитесь в поддержку." });
    }

    user.accountStatus = "active";
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    setAuthCookie(res, user);

    res.json({
      message: "Email подтверждён.",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("[verifyEmail]", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    const email = emailRaw?.trim().toLowerCase();
    const okMessage = "Если этот адрес зарегистрирован и ждёт подтверждения, мы отправили письмо.";

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.json({ message: okMessage, emailSent: false });
    }

    const pendingExists = await PendingRegistration.findOne({ email }).select("_id").lean();
    if (pendingExists) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);
      const updateResult = await PendingRegistration.updateOne(
        { email },
        { $set: { token, expiresAt } }
      );
      if (updateResult.matchedCount === 0) {
        console.warn("[resendVerification] заявка не обновлена (нет документа):", email);
        return res.json({ message: okMessage, emailSent: false });
      }

      const verifyUrl = buildClientVerifyUrl(token);
      const mailResult = await sendVerificationEmail({ to: email, verifyUrl, isResend: true });
      if (!mailResult.sent && mailResult.error) {
        console.error("[resendVerification] не удалось отправить:", mailResult.error);
      }

      const isDev = process.env.NODE_ENV !== "production";
      return res.json({
        message: okMessage,
        emailSent: Boolean(mailResult.sent),
        ...(isDev && !mailResult.sent && verifyUrl ? { devVerificationUrl: verifyUrl } : {}),
      });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== "user") {
      return res.json({ message: okMessage, emailSent: false });
    }

    const status = effectiveAccountStatus(user);
    if (status !== "pending") {
      return res.json({ message: okMessage, emailSent: false });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + VERIFY_TTL_MS);
    const updUser = await User.updateOne(
      { _id: user._id },
      { $set: { emailVerificationToken: token, emailVerificationExpires } }
    );
    if (updUser.matchedCount === 0) {
      console.warn("[resendVerification] пользователь не обновлён:", email);
      return res.json({ message: okMessage, emailSent: false });
    }

    const verifyUrl = buildClientVerifyUrl(token);
    const mailResult = await sendVerificationEmail({ to: user.email, verifyUrl, isResend: true });
    if (!mailResult.sent && mailResult.error) {
      console.error("[resendVerification] не удалось отправить:", mailResult.error);
    }

    const isDev = process.env.NODE_ENV !== "production";
    res.json({
      message: okMessage,
      emailSent: Boolean(mailResult.sent),
      ...(isDev && !mailResult.sent && verifyUrl ? { devVerificationUrl: verifyUrl } : {}),
    });
  } catch (error) {
    console.error("[resendVerification]", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};