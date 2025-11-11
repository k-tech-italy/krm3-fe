import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import * as oauthApi from "./oauth";
import { restapi } from "./restapi";

// Mock the restapi module
vi.mock("./restapi", () => ({
  restapi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("oauth API", () => {
  // Store original values
  const originalLocation = window.location;
  const originalLocalStorage = window.localStorage;

  // Mock window.location
  const mockLocation = {
    protocol: "https:",
    host: "example.com",
    toString: vi.fn(() => "https://example.com/dashboard"),
    replace: vi.fn(),
  };

  // Mock localStorage
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset location mock
    delete (window as any).location;
    (window as any).location = mockLocation;
    // Reset localStorage mock
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    // Restore original values
    (window as any).location = originalLocation;
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
    });
  });

  describe("loginUser", () => {
    it("should login user with username and password", async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await oauthApi.loginUser("testuser", "testpassword");

      expect(restapi.post).toHaveBeenCalledWith("auth/login/", {
        username: "testuser",
        password: "testpassword",
      });
    });

    it("should login with different credentials", async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await oauthApi.loginUser("anotheruser", "anotherpass");

      expect(restapi.post).toHaveBeenCalledWith("auth/login/", {
        username: "anotheruser",
        password: "anotherpass",
      });
    });

    it("should return the response from the API", async () => {
      const mockResponse = { data: { token: "abc123", user: "testuser" } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      const result = await oauthApi.loginUser("testuser", "testpassword");

      expect(result).toEqual(mockResponse);
    });
  });

  describe("loginGoogle", () => {
    it("should store current URL in localStorage", async () => {
      const mockResponse = { data: { authorizationUrl: "https://google.com/auth" } };
      vi.mocked(restapi.get).mockResolvedValue(mockResponse);

      await oauthApi.loginGoogle();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "next",
        "https://example.com/dashboard"
      );
    });

    it("should make GET request with correct OAuth provider and redirect URI", async () => {
      const mockResponse = { data: { authorizationUrl: "https://google.com/auth" } };
      vi.mocked(restapi.get).mockResolvedValue(mockResponse);

      await oauthApi.loginGoogle();

      expect(restapi.get).toHaveBeenCalledWith(
        "/o/google-oauth2/?redirect_uri=https://example.com/login"
      );
    });

    it("should redirect to authorization URL on success", async () => {
      const authUrl = "https://accounts.google.com/oauth/authorize?client_id=123";
      const mockResponse = { data: { authorizationUrl: authUrl } };
      vi.mocked(restapi.get).mockResolvedValue(mockResponse);

      await oauthApi.loginGoogle();

      expect(mockLocation.replace).toHaveBeenCalledWith(authUrl);
    });

    it("should redirect to /login when authorization URL is missing", async () => {
      const mockResponse = { data: {} };
      vi.mocked(restapi.get).mockResolvedValue(mockResponse);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await oauthApi.loginGoogle();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Authorization URL not found in the response"
      );
      expect(mockLocation.replace).toHaveBeenCalledWith("/login");

      consoleErrorSpy.mockRestore();
    });

    it("should redirect to /login when response data is null", async () => {
      const mockResponse = { data: null };
      vi.mocked(restapi.get).mockResolvedValue(mockResponse);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await oauthApi.loginGoogle();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Authorization URL not found in the response"
      );
      expect(mockLocation.replace).toHaveBeenCalledWith("/login");

      consoleErrorSpy.mockRestore();
    });

    it("should handle API errors and redirect to /login", async () => {
      const error = new Error("Network error");
      vi.mocked(restapi.get).mockRejectedValue(error);
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await oauthApi.loginGoogle();

      expect(consoleLogSpy).toHaveBeenCalledWith("Error logging in", error);
      expect(mockLocation.replace).toHaveBeenCalledWith("/login");

      consoleLogSpy.mockRestore();
    });

    it("should log message when starting login", async () => {
      const mockResponse = { data: { authorizationUrl: "https://google.com/auth" } };
      vi.mocked(restapi.get).mockResolvedValue(mockResponse);
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await oauthApi.loginGoogle();

      expect(consoleLogSpy).toHaveBeenCalledWith("Logging in with Google");

      consoleLogSpy.mockRestore();
    });
  });

  describe("googleAuthenticate", () => {
    it("should authenticate with state and code", async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await oauthApi.googleAuthenticate("state123", "code456");

      expect(restapi.post).toHaveBeenCalledWith(
        "/o/google-oauth2/",
        "state=state123&code=code456",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    });

    it("should URL encode state and code parameters", async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await oauthApi.googleAuthenticate("state with spaces", "code&special=chars");

      const expectedFormBody =
        "state=state%20with%20spaces&code=code%26special%3Dchars";
      expect(restapi.post).toHaveBeenCalledWith(
        "/o/google-oauth2/",
        expectedFormBody,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    });

    it("should return next URL from localStorage after successful authentication", async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);
      localStorageMock.setItem("next", "https://example.com/dashboard");

      const result = await oauthApi.googleAuthenticate("state123", "code456");

      expect(result).toBe("https://example.com/dashboard");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("next");
    });

    it("should return default '/' when next URL is not in localStorage", async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      const result = await oauthApi.googleAuthenticate("state123", "code456");

      expect(result).toBe("/");
    });

    it("should remove next URL from localStorage after authentication", async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);
      localStorageMock.setItem("next", "https://example.com/dashboard");

      await oauthApi.googleAuthenticate("state123", "code456");

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("next");
    });

    it("should return null when authentication fails", async () => {
      const error = new Error("Authentication failed");
      vi.mocked(restapi.post).mockRejectedValue(error);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await oauthApi.googleAuthenticate("state123", "code456");

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Authentication failed", error);

      consoleErrorSpy.mockRestore();
    });

    it("should return null when state is missing", async () => {
      const result = await oauthApi.googleAuthenticate("", "code456");

      expect(result).toBeNull();
      expect(restapi.post).not.toHaveBeenCalled();
    });

    it("should return null when code is missing", async () => {
      const result = await oauthApi.googleAuthenticate("state123", "");

      expect(result).toBeNull();
      expect(restapi.post).not.toHaveBeenCalled();
    });

    it("should return null when both state and code are missing", async () => {
      const result = await oauthApi.googleAuthenticate("", "");

      expect(result).toBeNull();
      expect(restapi.post).not.toHaveBeenCalled();
    });

    it("should handle localStorage returning null for next URL", async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);
      // localStorage.getItem will return null by default

      const result = await oauthApi.googleAuthenticate("state123", "code456");

      expect(result).toBe("/");
    });
  });
});
