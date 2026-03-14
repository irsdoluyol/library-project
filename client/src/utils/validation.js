
export const REGISTER_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    required: true,
  },
  surname: {
    maxLength: 50,
    required: false,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 6,
    maxLength: 100,
    required: true,
  },
};

export function validateRegister(data) {
  const errors = {};
  const { name, surname, email, password } = REGISTER_RULES;

  const n = (data.name ?? "").trim();
  const s = (data.surname ?? "").trim();
  const e = (data.email ?? "").trim().toLowerCase();
  const p = data.password ?? "";

  if (name.required && n.length < name.minLength) {
    errors.name = `Имя должно содержать не менее ${name.minLength} символов`;
  } else if (n.length > name.maxLength) {
    errors.name = `Имя не более ${name.maxLength} символов`;
  }

  if (surname.required === false && s.length > 0 && s.length > surname.maxLength) {
    errors.surname = `Фамилия не более ${surname.maxLength} символов`;
  }

  if (email.required && !e) {
    errors.email = "Введите email";
  } else if (e && !email.pattern.test(e)) {
    errors.email = "Некорректный формат email (например, user@example.com)";
  }

  if (password.required && p.length < password.minLength) {
    errors.password = `Пароль должен содержать не менее ${password.minLength} символов`;
  } else if (p.length > password.maxLength) {
    errors.password = `Пароль не более ${password.maxLength} символов`;
  }

  return errors;
}
