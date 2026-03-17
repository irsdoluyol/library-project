import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CatalogSearch from "./CatalogSearch.jsx";

describe("CatalogSearch", () => {
  it("renders search input and genre select", () => {
    render(
      <CatalogSearch
        search=""
        genre=""
        onSearchChange={vi.fn()}
        onGenreChange={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText(/поиск/i)).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("displays current search value", () => {
    render(
      <CatalogSearch
        search="Толстой"
        genre=""
        onSearchChange={vi.fn()}
        onGenreChange={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue("Толстой")).toBeTruthy();
  });

  it("calls onSearchChange when input changes", () => {
    const onSearchChange = vi.fn();
    render(
      <CatalogSearch
        search=""
        genre=""
        onSearchChange={onSearchChange}
        onGenreChange={vi.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/поиск/i), { target: { value: "книга" } });
    expect(onSearchChange).toHaveBeenCalledWith("книга");
  });

  it("calls onGenreChange when select changes", () => {
    const onGenreChange = vi.fn();
    render(
      <CatalogSearch
        search=""
        genre=""
        onSearchChange={vi.fn()}
        onGenreChange={onGenreChange}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Фантастика" } });
    expect(onGenreChange).toHaveBeenCalledWith("Фантастика");
  });

  it("has All genres option", () => {
    render(
      <CatalogSearch
        search=""
        genre=""
        onSearchChange={vi.fn()}
        onGenreChange={vi.fn()}
      />
    );
    expect(screen.getByRole("option", { name: /все жанры/i })).toBeTruthy();
  });
});
