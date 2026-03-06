import Request from "../models/Request.js";

export const createRequest = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { subject, message } = req.body;

    const subjectTrimmed = subject?.trim();
    const messageTrimmed = message?.trim();

    if (!subjectTrimmed || subjectTrimmed.length < 2) {
      return res.status(400).json({ message: "Тема должна содержать не менее 2 символов" });
    }
    if (subjectTrimmed.length > 200) {
      return res.status(400).json({ message: "Тема не более 200 символов" });
    }
    if (!messageTrimmed || messageTrimmed.length < 5) {
      return res.status(400).json({ message: "Сообщение должно содержать не менее 5 символов" });
    }
    if (messageTrimmed.length > 2000) {
      return res.status(400).json({ message: "Сообщение не более 2000 символов" });
    }

    const request = await Request.create({
      subject: subjectTrimmed,
      message: messageTrimmed,
      author: userId,
    });

    const populated = await Request.findById(request._id).populate("author", "name surname email");

    res.status(201).json(populated);
  } catch (error) {
    console.error("[createRequest]", error);
    res.status(500).json({ message: "Ошибка создания обращения" });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const requests = await Request.find({ author: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (error) {
    console.error("[getMyRequests]", error);
    res.status(500).json({ message: "Ошибка получения обращений" });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .populate("author", "name surname email")
      .lean();

    res.json(requests);
  } catch (error) {
    console.error("[getAllRequests]", error);
    res.status(500).json({ message: "Ошибка получения обращений" });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["new", "in_progress", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Недопустимый статус" });
    }

    const request = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("author", "name surname email");

    if (!request) {
      return res.status(404).json({ message: "Обращение не найдено" });
    }

    res.json(request);
  } catch (error) {
    console.error("[updateRequestStatus]", error);
    res.status(500).json({ message: "Ошибка обновления статуса" });
  }
};
