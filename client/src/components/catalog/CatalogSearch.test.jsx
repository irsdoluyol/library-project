import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CatalogSearch from "./CatalogSearch.jsx";

function renderSearch(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CatalogSearch />
    </MemoryRouter>
  );
}

describe("CatalogSearch", () => {
  it("renders search input and genre button", () => {
    renderSearch("/");
    expect(screen.getByPlaceholderText(/поиск/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /жанр/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /найти/i })).toBeTruthy();
  });

  it("shows current search from URL", () => {
    renderSearch("/?search=%D0%A2%D0%BE%D0%BB%D1%81%D1%82%D0%BE%D0%B9");
    expect(screen.getByDisplayValue("Толстой")).toBeTruthy();
  });
});
