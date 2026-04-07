import { request } from "./request.js";

export function fetchPendingUsers() {
  return request("/admin/users/pending");
}

export function approveUser(id) {
  return request(`/admin/users/${id}/approve`, { method: "PATCH" });
}

export function rejectUser(id) {
  return request(`/admin/users/${id}/reject`, { method: "PATCH" });
}
