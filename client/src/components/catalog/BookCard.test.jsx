import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BookCard from "./BookCard.jsx";

describe("BookCard", () => {
  const defaultBook = {
    _id: "1",
    title: "Война и мир",
    author: "Л. Толстой",
    available: true,
  };

  it("renders book title and author", () => {
    render(<BookCard book={defaultBook} />);
    expect(screen.getByText("Война и мир")).toBeTruthy();
    expect(screen.getByText("Л. Толстой")).toBeTruthy();
  });

  it("shows borrow button when user is logged in and book is available", () => {
    render(
      <BookCard book={defaultBook} isLoggedIn onBorrow={vi.fn()} pendingBorrowId={null} />
    );
    expect(screen.getByRole("button", { name: /взять/i })).toBeTruthy();
  });

  it("shows unavailable text when book is not available", () => {
    render(
      <BookCard
        book={{ ...defaultBook, available: false }}
        isLoggedIn
        onBorrow={vi.fn()}
        pendingBorrowId={null}
      />
    );
    expect(screen.getByText("Недоступно")).toBeTruthy();
  });

  it("calls onBorrow when borrow button is clicked", () => {
    const onBorrow = vi.fn();
    render(
      <BookCard book={defaultBook} isLoggedIn onBorrow={onBorrow} pendingBorrowId={null} />
    );
    fireEvent.click(screen.getByRole("button", { name: /взять/i }));
    expect(onBorrow).toHaveBeenCalledWith("1");
  });

  it("does not show actions when user is not logged in", () => {
    render(<BookCard book={defaultBook} isLoggedIn={false} />);
    expect(screen.queryByRole("button", { name: /взять/i })).toBeNull();
    expect(screen.queryByText("Недоступно")).toBeNull();
  });
});
