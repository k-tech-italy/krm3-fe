import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useMediaQuery, useColumnViewPreference } from "./useView";

describe("useView hooks", () => {
  describe("useMediaQuery", () => {
    let matchMediaMock: any;
    let listeners: ((event: any) => void)[] = [];

    beforeEach(() => {
      listeners = [];
      matchMediaMock = vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn((event: string, handler: (event: any) => void) => {
          listeners.push(handler);
        }),
        removeEventListener: vi.fn((event: string, handler: (event: any) => void) => {
          listeners = listeners.filter((l) => l !== handler);
        }),
      }));
      window.matchMedia = matchMediaMock;
    });

    afterEach(() => {
      listeners = [];
    });

    it("should return initial match status", () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: "(max-width: 768px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));

      expect(result.current).toBe(true);
      expect(matchMediaMock).toHaveBeenCalledWith("(max-width: 768px)");
    });

    it("should return false when media query does not match", () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(max-width: 768px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));

      expect(result.current).toBe(false);
    });

    it("should update when media query changes", () => {
      const mediaQueryList = {
        matches: false,
        media: "(max-width: 768px)",
        addEventListener: vi.fn((event: string, handler: (event: any) => void) => {
          listeners.push(handler);
        }),
        removeEventListener: vi.fn(),
      };

      matchMediaMock.mockReturnValue(mediaQueryList);

      const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));

      expect(result.current).toBe(false);

      // Simulate media query change
      act(() => {
        mediaQueryList.matches = true;
        listeners.forEach((listener) => listener({ matches: true }));
      });

      expect(result.current).toBe(true);
    });

    it("should add event listener on mount", () => {
      const addEventListener = vi.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(max-width: 768px)",
        addEventListener,
        removeEventListener: vi.fn(),
      });

      renderHook(() => useMediaQuery("(max-width: 768px)"));

      expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("should remove event listener on unmount", () => {
      const removeEventListener = vi.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(max-width: 768px)",
        addEventListener: vi.fn(),
        removeEventListener,
      });

      const { unmount } = renderHook(() => useMediaQuery("(max-width: 768px)"));

      unmount();

      expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("should handle different media queries", () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: query === "(min-width: 1024px)",
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { result: result1 } = renderHook(() =>
        useMediaQuery("(min-width: 1024px)")
      );
      const { result: result2 } = renderHook(() =>
        useMediaQuery("(max-width: 768px)")
      );

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(false);
    });

    it("should update listener when query changes", () => {
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();

      matchMediaMock.mockReturnValue({
        matches: false,
        media: "",
        addEventListener,
        removeEventListener,
      });

      const { rerender } = renderHook(
        ({ query }) => useMediaQuery(query),
        { initialProps: { query: "(max-width: 768px)" } }
      );

      expect(addEventListener).toHaveBeenCalledTimes(1);

      rerender({ query: "(max-width: 1024px)" });

      // Should remove old listener and add new one
      expect(removeEventListener).toHaveBeenCalledTimes(1);
      expect(addEventListener).toHaveBeenCalledTimes(2);
    });
  });

  describe("useColumnViewPreference", () => {
    let matchMediaMock: any;
    let localStorageMock: { [key: string]: string } = {};
    let listeners: ((event: any) => void)[] = [];

    beforeEach(() => {
      listeners = [];
      localStorageMock = {};

      // Mock localStorage
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn((key: string) => localStorageMock[key] || null),
          setItem: vi.fn((key: string, value: string) => {
            localStorageMock[key] = value;
          }),
          removeItem: vi.fn((key: string) => {
            delete localStorageMock[key];
          }),
          clear: vi.fn(() => {
            localStorageMock = {};
          }),
        },
        writable: true,
      });

      // Mock matchMedia
      matchMediaMock = vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn((event: string, handler: (event: any) => void) => {
          listeners.push(handler);
        }),
        removeEventListener: vi.fn(),
      }));
      window.matchMedia = matchMediaMock;
    });

    afterEach(() => {
      listeners = [];
    });

    it("should initialize with false on large screen even with localStorage true", () => {
      localStorageMock["isColumnView"] = "true";
      matchMediaMock.mockReturnValue({
        matches: false, // Large screen
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      // On large screens, isColumnView is always false due to useEffect
      expect(result.current.isColumnView).toBe(false);
      // But localStorage retains the user's preference
      expect(result.current.getIsColumnView()).toBe(true);
    });

    it("should initialize with false on large screen when localStorage is false", () => {
      localStorageMock["isColumnView"] = "false";
      matchMediaMock.mockReturnValue({
        matches: false, // Large screen
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      expect(result.current.isColumnView).toBe(false);
    });

    it("should initialize with true on small screen regardless of localStorage", () => {
      localStorageMock["isColumnView"] = "false";
      matchMediaMock.mockReturnValue({
        matches: true, // Small screen
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      expect(result.current.isColumnView).toBe(true);
    });

    it("should set column view and update localStorage", () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      act(() => {
        result.current.setColumnView(true);
      });

      expect(result.current.isColumnView).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith("isColumnView", "true");
    });

    it("should update column view to false", () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      act(() => {
        result.current.setColumnView(true);
      });

      expect(result.current.isColumnView).toBe(true);

      act(() => {
        result.current.setColumnView(false);
      });

      expect(result.current.isColumnView).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith("isColumnView", "false");
    });

    it("should return current localStorage value with getIsColumnView", () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      act(() => {
        result.current.setColumnView(true);
      });

      expect(result.current.getIsColumnView()).toBe(true);

      act(() => {
        result.current.setColumnView(false);
      });

      expect(result.current.getIsColumnView()).toBe(false);
    });

    it("should switch to column view when screen becomes small", () => {
      const mediaQueryList = {
        matches: false, // Start with large screen
        media: "(max-width: 1024px)",
        addEventListener: vi.fn((event: string, handler: (event: any) => void) => {
          listeners.push(handler);
        }),
        removeEventListener: vi.fn(),
      };

      matchMediaMock.mockReturnValue(mediaQueryList);

      const { result } = renderHook(() => useColumnViewPreference());

      // Initially on large screen with false
      act(() => {
        result.current.setColumnView(false);
      });

      expect(result.current.isColumnView).toBe(false);

      // Simulate screen size change to small
      act(() => {
        mediaQueryList.matches = true;
        listeners.forEach((listener) => listener({ matches: true }));
      });

      // Should automatically switch to column view on small screen
      expect(result.current.isColumnView).toBe(true);
    });

    it("should maintain column view preference when screen becomes large", () => {
      localStorageMock["isColumnView"] = "true";
      const mediaQueryList = {
        matches: true, // Start with small screen
        media: "(max-width: 1024px)",
        addEventListener: vi.fn((event: string, handler: (event: any) => void) => {
          listeners.push(handler);
        }),
        removeEventListener: vi.fn(),
      };

      matchMediaMock.mockReturnValue(mediaQueryList);

      const { result } = renderHook(() => useColumnViewPreference());

      expect(result.current.isColumnView).toBe(true);

      // Simulate screen size change to large
      act(() => {
        mediaQueryList.matches = false;
        listeners.forEach((listener) => listener({ matches: false }));
      });

      // Should maintain false on large screen
      expect(result.current.isColumnView).toBe(false);
    });

    it("should handle missing localStorage value", () => {
      // No value in localStorage
      matchMediaMock.mockReturnValue({
        matches: false, // Large screen
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      // Should default to false when no localStorage value
      expect(result.current.isColumnView).toBe(false);
      expect(result.current.getIsColumnView()).toBe(false);
    });

    it("should persist multiple setColumnView calls", () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      act(() => {
        result.current.setColumnView(true);
      });
      expect(result.current.isColumnView).toBe(true);
      expect(localStorageMock["isColumnView"]).toBe("true");

      act(() => {
        result.current.setColumnView(false);
      });
      expect(result.current.isColumnView).toBe(false);
      expect(localStorageMock["isColumnView"]).toBe("false");

      act(() => {
        result.current.setColumnView(true);
      });
      expect(result.current.isColumnView).toBe(true);
      expect(localStorageMock["isColumnView"]).toBe("true");
    });

    it("should return correct interface with all methods", () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(max-width: 1024px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useColumnViewPreference());

      expect(result.current).toHaveProperty("isColumnView");
      expect(result.current).toHaveProperty("setColumnView");
      expect(result.current).toHaveProperty("getIsColumnView");
      expect(typeof result.current.isColumnView).toBe("boolean");
      expect(typeof result.current.setColumnView).toBe("function");
      expect(typeof result.current.getIsColumnView).toBe("function");
    });
  });
});
