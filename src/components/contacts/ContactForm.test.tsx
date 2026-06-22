import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "react-toastify";
import * as useContacts from "../../hooks/useContacts.tsx";
import { ContactForm } from "./ContactForm.tsx";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockClients = [{ id: 1, name: "Acme" }];
const mockTitles = [{ value: "doctor", label: "Doctor" }];

const fillRequired = () => {
  const inputs = screen.getAllByRole("textbox");
  fireEvent.change(inputs[0], { target: { value: "John" } });
  fireEvent.change(inputs[1], { target: { value: "Doe" } });
};

describe("ContactForm", () => {
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMutate = vi.fn();
    vi.spyOn(useContacts, "useGetClients").mockReturnValue({
      data: mockClients,
      isLoading: false,
    } as ReturnType<typeof useContacts.useGetClients>);
    vi.spyOn(useContacts, "useGetTitles").mockReturnValue({
      data: mockTitles,
      isLoading: false,
    } as ReturnType<typeof useContacts.useGetTitles>);
    vi.spyOn(useContacts, "useCreateContact").mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useContacts.useCreateContact>);
  });

  it("renders form fields", () => {
    render(<ContactForm />);
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Emails")).toBeInTheDocument();
    expect(screen.getByText("Phones")).toBeInTheDocument();
    expect(screen.getByText("Picture URL")).toBeInTheDocument();
  });

  it("shows error when no valid email provided", () => {
    const { container } = render(<ContactForm />);
    fillRequired();
    fireEvent.submit(container.querySelector("form")!);

    expect(screen.getByText("At least one valid email is required")).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows error for invalid email format", () => {
    const { container } = render(<ContactForm />);
    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "invalid" },
    });
    fireEvent.submit(container.querySelector("form")!);

    expect(screen.getByText("At least one valid email is required")).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows phone validation error", () => {
    const { container } = render(<ContactForm />);
    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("+1234567890"), { target: { value: "abc" } });
    fireEvent.submit(container.querySelector("form")!);

    expect(screen.getByText(/Invalid phone format/)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows error for invalid picture URL", () => {
    const { container } = render(<ContactForm />);
    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://example.com/photo.jpg"), {
      target: { value: "not-a-url" },
    });
    fireEvent.submit(container.querySelector("form")!);

    expect(screen.getByText(/Invalid URL/)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls toast.success on successful create", () => {
    const { container } = render(<ContactForm />);
    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "john@example.com" },
    });
    mockMutate.mockImplementation((_data, options) => options.onSuccess?.());
    fireEvent.submit(container.querySelector("form")!);

    expect(toast.success).toHaveBeenCalledWith("Contact created successfully");
  });

  it("calls onSuccess when 'Create contact' button is clicked", () => {
    const onSuccess = vi.fn();
    render(<ContactForm onSuccess={onSuccess} />);
    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "john@example.com" },
    });
    mockMutate.mockImplementation((_data, options) => options.onSuccess?.());
    fireEvent.click(screen.getByText("Create contact"));

    expect(onSuccess).toHaveBeenCalled();
  });

  it("does not call onSuccess when 'Create and add another' is clicked", () => {
    const onSuccess = vi.fn();
    render(<ContactForm onSuccess={onSuccess} />);
    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "john@example.com" },
    });
    mockMutate.mockImplementation((_data, options) => options.onSuccess?.());
    fireEvent.click(screen.getByText("Create and add another"));

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("still calls onSuccess on 'Create contact' after clicking 'Create and add another' first", () => {
    const onSuccess = vi.fn();
    render(<ContactForm onSuccess={onSuccess} />);
    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "john@example.com" },
    });
    mockMutate.mockImplementation((_data, options) => options.onSuccess?.());

    fireEvent.click(screen.getByText("Create and add another"));
    expect(onSuccess).not.toHaveBeenCalled();

    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "jane@example.com" },
    });

    fireEvent.click(screen.getByText("Create contact"));
    expect(onSuccess).toHaveBeenCalled();
  });
});
