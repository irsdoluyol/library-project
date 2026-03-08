import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BorrowingItem from "./BorrowingItem.jsx";

const wrap = (ui) => (
  <MemoryRouter>{ui}</MemoryRouter>
);

describe("BorrowingItem", () => {
  const borrowing = {
    _id: "bor1",
    book: {
      _id: "book1",
      title: "Война и мир",
      author: "Л. Толстой",
      filePath: "/uploads/book1.pdf",
    },
  };

  it("renders book title and author", () => {
    render(wrap(<BorrowingItem borrowing={borrowing} onReturn={vi.fn()} isPending={false} />));
    expect(screen.getByText("Война и мир")).toBeTruthy();
    expect(screen.getByText(/Л\. Толстой/)).toBeTruthy();
  });

  it("shows Read link when book has filePath", () => {
    render(wrap(<BorrowingItem borrowing={borrowing} onReturn={vi.fn()} isPending={false} />));
    const link = screen.getByRole("link", { name: /читать/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/read/book1");
  });

  it("does not show Read link when book has no filePath", () => {
    const b = { ...borrowing, book: { ...borrowing.book, filePath: null } };
    render(wrap(<BorrowingItem borrowing={b} onReturn={vi.fn()} isPending={false} />));
    expect(screen.queryByRole("link", { name: /читать/i })).toBeNull();
  });

  it("calls onReturn when Return button is clicked", () => {
    const onReturn = vi.fn();
    render(wrap(<BorrowingItem borrowing={borrowing} onReturn={onReturn} isPending={false} />));
    fireEvent.click(screen.getByRole("button", { name: /вернуть/i }));
    expect(onReturn).toHaveBeenCalledWith("book1");
  });

  it("disables Return button when isPending", () => {
    render(wrap(<BorrowingItem borrowing={borrowing} onReturn={vi.fn()} isPending={true} />));
    const btn = screen.getByRole("button", { name: /\.\.\./ });
    expect(btn.disabled).toBe(true);
  });

  it("returns null when book is missing", () => {
    const { container } = render(
      wrap(<BorrowingItem borrowing={{ _id: "b", book: null }} onReturn={vi.fn()} isPending={false} />)
    );
    expect(container.firstChild).toBeNull();
  });
});
