import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ContactListTile from "./ContactListTile.tsx";
import { Contact } from "../../restapi/types.ts";

const contact: Contact = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  isActive: true,
  internalNotes: "",
  jobTitle: "",
  addresses: [{ address: "123 Main St" }],
  emails: [{ address: "john@test.com" }],
  phones: [{ number: "+1234567890" }],
  websites: [],
};

describe("ContactListTile", () => {
  it("renders contact name and info", () => {
    render(
      <MemoryRouter>
        <ContactListTile contact={contact} />
      </MemoryRouter>
    );
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
  });

  it("applies dim styling for inactive contact", () => {
    render(
      <MemoryRouter>
        <ContactListTile contact={{ ...contact, isActive: false }} />
      </MemoryRouter>
    );
    const tile = screen.getByTestId("contact-list-tile-1");
    expect(tile.className).toContain("bg-card-dim");
    expect(tile.className).toContain("opacity-70");
  });
});
