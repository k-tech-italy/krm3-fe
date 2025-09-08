import {fireEvent, render, screen} from "@testing-library/react";
import { vi, beforeEach, describe, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";
import * as ThemeHook from "next-themes";

const setThemeMock = vi.fn();

vi.mock("next-themes", () => ({
    useTheme: vi.fn(() => ({
        theme: "light",
        setTheme: setThemeMock,
    })),
}));

describe("ThemeToggle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (ThemeHook.useTheme as any).mockImplementation(() => ({
            theme: "light",
            setTheme: setThemeMock,
        }));
    });

    it("renders in light theme", () => {
        render(<ThemeToggle />);
        expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
    });

    it("renders in dark theme", () => {
        (ThemeHook.useTheme as any).mockImplementation(() => ({
            theme: "dark",
            setTheme: setThemeMock,
        }));
        render(<ThemeToggle />);
        expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
    });

    it("calls setTheme when clicked", () => {
        render(<ThemeToggle />);
        fireEvent.click(screen.getByTestId("theme-toggle"))
        expect(setThemeMock).toBeCalledWith("dark")
    })
    it("calls setTheme for dark theme", () => {
        (ThemeHook.useTheme as any).mockImplementation(() => ({
            theme: "dark",
            setTheme: setThemeMock,
        }));
        render(<ThemeToggle />);
        fireEvent.click(screen.getByTestId("theme-toggle"))
        expect(setThemeMock).toBeCalledWith("light")
    })
});
