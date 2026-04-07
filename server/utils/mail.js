import nodemailer from "nodemailer";

export function buildClientVerifyUrl(token) {
  const base = (process.env.CLIENT_URL || "http://localhost:5174").replace(/\/$/, "");
  return `${base}/verify-email?token=${encodeURIComponent(token)}`;
}

function createSmtpTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  const user = SMTP_USER.trim();
  const pass = (SMTP_PASS || "").trim();
  const host = SMTP_HOST.trim().toLowerCase();

  const timeouts = {
    connectionTimeout: 60_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
  };

  if (host === "smtp.gmail.com" || host.endsWith(".gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      ...timeouts,
    });
  }

  const port = Number(SMTP_PORT) || 587;
  const secureExplicit = SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureExplicit === "true" || secureExplicit === "1" || (!secureExplicit && port === 465);

  return nodemailer.createTransport({
    host: SMTP_HOST.trim(),
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 && !secure
      ? {
          requireTLS: true,
          tls: { minVersion: "TLSv1.2" },
        }
      : {}),
    ...timeouts,
  });
}

export async function sendVerificationEmail({ to, verifyUrl, isResend = false }) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const subject = isResend
    ? "Новая ссылка для подтверждения — онлайн-библиотека"
    : "Подтвердите регистрацию — онлайн-библиотека";
  const intro = isResend
    ? "Вы запросили повторную отправку. Перейдите по ссылке ниже (она заменяет предыдущую)."
    : "Подтвердите email, перейдя по ссылке:";
  const text = `Здравствуйте!\n\n${intro}\n${verifyUrl}\n\nСсылка действует 48 часов.\n\nЕсли вы не регистрировались, проигнорируйте это письмо.`;
  const html = `<p>Здравствуйте!</p><p>${intro.replace(/\n/g, "<br/>")}</p><p><a href="${verifyUrl}">Подтвердить email</a></p><p>Ссылка действует 48 часов.</p>`;

  if (!SMTP_HOST?.trim() || !SMTP_USER?.trim()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[mail] SMTP не настроен (нужны SMTP_HOST и SMTP_USER в server/.env) — ссылка для ${to}:\n${verifyUrl}\n`);
    } else {
      console.warn("[mail] SMTP не настроен: письмо не отправлено.");
    }
    return { sent: false, skipped: true };
  }

  if (!(SMTP_PASS || "").trim()) {
    console.error("[mail] SMTP_PASS пустой — укажите пароль приложения Gmail в server/.env");
    return { sent: false, error: "SMTP_PASS не задан" };
  }

  const transport = createSmtpTransport();

  try {
    const info = await transport.sendMail({
      from: SMTP_FROM?.trim() || SMTP_USER.trim(),
      to,
      subject,
      text,
      html,
    });
    console.log(
      `[mail] письмо отправлено → ${to}${isResend ? " (повторная отправка)" : ""}, messageId=${info.messageId ?? "—"}`
    );
    return { sent: true };
  } catch (err) {
    console.error("[mail] ошибка отправки:", err.message);
    if (err.response) {
      console.error("[mail] ответ SMTP:", err.response);
    }
    return { sent: false, error: err.message || "SMTP error" };
  }
}
