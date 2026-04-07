import { request } from "./request.js";

export function verifyEmail(token, { signal } = {}) {
  return request("/auth/verify-email", {
    method: "POST",
    body: { token },
    signal,
  });
}

export function resendVerification(email) {
  return request("/auth/resend-verification", {
    method: "POST",
    body: { email },
  });
}
