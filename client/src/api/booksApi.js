import { API_URL } from "../config.js";
import { request } from "./request.js";

export async function fetchBooks({
  search = "",
  genre = "",
  page = 1,
  limit = 8,
  sort = "createdAt",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("sort", sort);
  if (search) params.set("search", search);
  if (genre) params.set("genre", genre);

  return request(`/books?${params.toString()}`);
}

export async function fetchMyBooks(token) {
  return request("/books/my", { token });
}

export async function createBook(token, payload) {
  return request("/books", { method: "POST", body: payload, token });
}

export async function updateBook(token, id, payload) {
  return request(`/books/${id}`, { method: "PUT", body: payload, token });
}

export async function deleteBook(token, id) {
  return request(`/books/${id}`, { method: "DELETE", token });
}

export async function borrowBook(token, bookId) {
  return request(`/books/${bookId}/borrow`, { method: "POST", token });
}

export async function returnBook(token, bookId) {
  return request(`/books/${bookId}/return`, { method: "POST", token });
}

export async function uploadBookFile(token, bookId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_URL}/books/${bookId}/upload`;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.message || `Ошибка ${response.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function fetchBookContent(token, bookId) {
  const url = `${API_URL}/books/${bookId}/read`;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { headers });
  const contentType = response.headers.get("Content-Type") || "";

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Ошибка ${response.status}`);
  }

  if (contentType.includes("application/pdf")) {
    const blob = await response.blob();
    return { type: "pdf", blob };
  }
  const data = await response.json().catch(() => ({}));
  return { type: "txt", content: data.content || "" };
}
