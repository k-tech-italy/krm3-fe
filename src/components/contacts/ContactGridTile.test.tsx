import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ContactGridTile from "./ContactGridTile.tsx";
import { Contact } from "../../restapi/types.ts";

const contact: Contact = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  isActive: true,
  internalNotes: "",
  jobTitle: "",
  addresses: [],
  emails: [],
  phones: [],
  websites: [],
};

const renderTile = (c: Contact) =>
  render(
    <MemoryRouter>
      <ContactGridTile contact={c} />
    </MemoryRouter>
  );

describe("ContactGridTile", () => {
  it("renders contact name", () => {
    renderTile(contact);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("shows placeholder when no picture", () => {
    renderTile({ ...contact, picture: undefined });
    expect(screen.getByTestId("user-picture-placeholder-1")).toBeInTheDocument();
  });

  it("applies dim styling for inactive contact", () => {
    renderTile({ ...contact, isActive: false });
    const tile = screen.getByTestId("contact-grid-tile-1");
    expect(tile.className).toContain("bg-card-dim");
    expect(tile.className).toContain("opacity-70");
  });
});
