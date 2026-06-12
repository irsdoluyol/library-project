import mongoose from "mongoose";
import User from "../models/User.js";
import PendingRegistration from "../models/PendingRegistration.js";
import { effectiveAccountStatus } from "../utils/accountStatus.js";
import { logModeration } from "../utils/logger.js";

const isValidId = (id) =>
  id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

export const listPendingUsers = async (req, res) => {
  try {
    const fromPending = await PendingRegistration.find({ visibleToModerator: true })
      .select("name surname email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const legacyUsers = await User.find({
      role: "user",
      $or: [
        { accountStatus: "pending" },
        {
          $and: [
            { $or: [{ accountStatus: { $exists: false } }, { accountStatus: null }] },
            { emailVerificationToken: { $exists: true, $nin: [null, ""] } },
          ],
        },
      ],
    })
      .select("name surname email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const pendingEmails = new Set(fromPending.map((p) => String(p.email).toLowerCase()));
    const legacyFiltered = legacyUsers.filter(
      (u) => !pendingEmails.has(String(u.email).toLowerCase())
    );

    const users = [...fromPending, ...legacyFiltered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ users });
  } catch (error) {
    console.error("[listPendingUsers]", error);
    res.status(500).json({ message: "Ошибка загрузки заявок" });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Некорректный ID пользователя" });
    }

    const pendingReg = await PendingRegistration.findById(id).select("+password");
    if (pendingReg) {
      const exists = await User.findOne({ email: pendingReg.email });
      if (exists) {
        await PendingRegistration.deleteOne({ _id: pendingReg._id });
        return res.status(400).json({ message: "Этот email уже зарегистрирован" });
      }

      const user = await User.create({
        name: pendingReg.name,
        surname: pendingReg.surname || undefined,
        email: pendingReg.email,
        password: pendingReg.password,
        role: "user",
        accountStatus: "active",
      });
      await PendingRegistration.deleteOne({ _id: pendingReg._id });

      const adminId = req.user?.id || req.user?._id;
      logModeration.approveUser(adminId, user._id, user.email);

      return res.json({
        message: "Регистрация подтверждена",
        user: {
          id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          accountStatus: user.accountStatus,
        },
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    if (user.role !== "user") {
      return res.status(400).json({ message: "Нельзя изменить статус администратора" });
    }
    if (effectiveAccountStatus(user) !== "pending") {
      return res.status(400).json({ message: "Заявка уже обработана" });
    }

    user.accountStatus = "active";
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const adminId = req.user?.id || req.user?._id;
    logModeration.approveUser(adminId, user._id, user.email);

    res.json({
      message: "Регистрация подтверждена",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("[approveUser]", error);
    res.status(500).json({ message: "Ошибка подтверждения" });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Некорректный ID пользователя" });
    }

    const pendingReg = await PendingRegistration.findById(id);
    if (pendingReg) {
      await PendingRegistration.deleteOne({ _id: pendingReg._id });
      const adminId = req.user?.id || req.user?._id;
      logModeration.rejectUser(adminId, null, pendingReg.email);
      return res.json({
        message: "Заявка отклонена",
        user: {
          id: pendingReg._id,
          email: pendingReg.email,
          accountStatus: "rejected",
        },
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    if (user.role !== "user") {
      return res.status(400).json({ message: "Нельзя изменить статус администратора" });
    }
    if (effectiveAccountStatus(user) !== "pending") {
      return res.status(400).json({ message: "Заявка уже обработана" });
    }

    user.accountStatus = "rejected";
    await user.save();

    const adminId = req.user?.id || req.user?._id;
    logModeration.rejectUser(adminId, user._id, user.email);

    res.json({
      message: "Регистрация отклонена",
      user: {
        id: user._id,
        email: user.email,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("[rejectUser]", error);
    res.status(500).json({ message: "Ошибка отклонения" });
  }
};
