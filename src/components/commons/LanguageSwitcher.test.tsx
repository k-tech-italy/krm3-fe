import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LanguageSwitcher from "./LanguageSwitcher";

const mockChangeLanguage = vi.fn();

const supportedLanguages = [
  { languageCode: "en", language: "English" },
  { languageCode: "it", language: "Italiano" },
  { languageCode: "fr", language: "Français" },
];

vi.mock("../../hooks/useTranslation.tsx", () => ({
  useChangeLanguage: () => ({
    mutate: mockChangeLanguage,
    isLoading: false,
  }),
  useGetSupportedLanguages: () => ({
    data: supportedLanguages,
    isLoading: false,
  }),
}));

vi.mock("./AuthContext.tsx", () => ({
  useAuthContext: () => ({
    user: {
      id: 1,
      email: "test@test.com",
      resource: { id: 42 },
    },
  }),
}));

vi.mock("react-cookie", () => ({
  useCookies: () => [{ django_language: "en" }, vi.fn()],
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByTestId("toggle-menu-button")).toBeInTheDocument();
  });

  it("should show all supported language options after opening the dropdown", () => {
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByTestId("toggle-menu-button"));

    supportedLanguages.forEach(({ language }) => {
      expect(screen.getByText(language)).toBeInTheDocument();
    });
  });

  it("should call changeLanguage with the correct args when a language is clicked", () => {
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByTestId("toggle-menu-button"));
    fireEvent.click(screen.getByText("Italiano"));

    expect(mockChangeLanguage).toHaveBeenCalledWith({
      language_code: "it",
      resourceId: 42,
    });
  });

  it("should disable the currently selected language", () => {
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByTestId("toggle-menu-button"));

    const englishButton = screen.getByText("English").closest("button");
    expect(englishButton).toBeDisabled();
  });
});
