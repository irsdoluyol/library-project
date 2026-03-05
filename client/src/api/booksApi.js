import { API_URL } from "../config.js";

export async function fetchBooks({ search = "", genre = "", page = 1, limit = 8, sort = "createdAt" } = {}) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("sort", sort);

  if (search) {
    params.set("search", search);
  }

  if (genre) {
    params.set("genre", genre);
  }

  const response = await fetch(`${API_URL}/books?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load books");
  }

  return data;
}

export async function fetchMyBooks(token) {
  const response = await fetch(`${API_URL}/books/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load your books");
  }

  return data;
}

