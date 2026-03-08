import { request } from "./request.js";

export async function createRequest({ subject, message }) {
  return request("/requests", {
    method: "POST",
    body: { subject, message },
  });
}

export async function fetchMyRequests() {
  return request("/requests");
}

export async function fetchAllRequests() {
  return request("/requests/all");
}

export async function updateRequestStatus(id, status) {
  return request(`/requests/${id}`, {
    method: "PATCH",
    body: { status },
  });
}
