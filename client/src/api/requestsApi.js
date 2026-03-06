import { request } from "./request.js";

export async function createRequest(token, { subject, message }) {
  return request("/requests", {
    method: "POST",
    body: { subject, message },
    token,
  });
}

export async function fetchMyRequests(token) {
  return request("/requests", { token });
}

export async function fetchAllRequests(token) {
  return request("/requests/all", { token });
}

export async function updateRequestStatus(token, id, status) {
  return request(`/requests/${id}`, {
    method: "PATCH",
    body: { status },
    token,
  });
}
