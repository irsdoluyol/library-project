import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookCard from "./BookCard.jsx";

describe("BookCard", () => {
  const defaultBook = {
    _id: "1",
    title: "Война и мир",
    author: "Л. Толстой",
    available: true,
  };

  it("renders book title and author", () => {
    render(
      <MemoryRouter>
        <BookCard book={defaultBook} />
      </MemoryRouter>
    );
    expect(screen.getByText("Война и мир")).toBeTruthy();
    expect(screen.getByText("Л. Толстой")).toBeTruthy();
  });

  it("links to book detail for everyone", () => {
    render(
      <MemoryRouter>
        <BookCard book={defaultBook} />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: /подробнее/i });
    expect(link.getAttribute("href")).toBe("/book/1");
  });
});
