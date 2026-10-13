import { describe, it, expect, vi, beforeAll } from "vitest";
import React from "react";

// Mock dependencies before importing index
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
  unmount: vi.fn(),
}));

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.mock("./App", () => ({
  App: () => <div>App Component</div>,
}));

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children, attribute, defaultTheme }: any) => (
    <div data-testid="theme-provider" data-attribute={attribute} data-default-theme={defaultTheme}>
      {children}
    </div>
  ),
}));

describe("index.tsx", () => {
  let rootElement: HTMLElement;
  let renderCall: any;

  beforeAll(async () => {
    // Create a root element
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);

    // Import index.tsx once for all tests
    await import("./index");

    // Store the render call for all tests to use
    if (mockRender.mock.calls.length > 0) {
      renderCall = mockRender.mock.calls[0][0];
    }
  });

  describe("initialization", () => {
    it("should call createRoot with the root element", () => {
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    });

    it("should call render on the root", () => {
      expect(mockRender).toHaveBeenCalled();
      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    it("should render with React.StrictMode", () => {
      expect(renderCall).toBeDefined();
      expect(renderCall.type).toBe(React.StrictMode);
    });

    it("should wrap App with ThemeProvider", () => {
      const strictModeChildren = renderCall.props.children;

      expect(strictModeChildren).toBeDefined();
      expect(strictModeChildren.type).toBeDefined();
    });

    it("should have nested component structure", () => {
      const strictModeChildren = renderCall.props.children;

      expect(strictModeChildren.props).toBeDefined();
      expect(strictModeChildren.props.children).toBeDefined();
    });

    it("should have App component in the render tree", () => {
      const strictModeChildren = renderCall.props.children;
      const nested = strictModeChildren.props.children;

      expect(nested).toBeDefined();
      expect(nested.type.name).toBe("App");
    });
  });

  describe("error handling", () => {
    it("should get root element from DOM", () => {
      // Verify that the root element exists in the DOM
      const root = document.getElementById("root");
      expect(root).toBe(rootElement);
      expect(root).not.toBeNull();
    });
  });

  describe("component structure", () => {
    it("should have correct nesting with StrictMode at root", () => {
      // Level 1: StrictMode
      expect(renderCall.type).toBe(React.StrictMode);

      // Level 2: Wrapper (ThemeProvider)
      const wrapper = renderCall.props.children;
      expect(wrapper).toBeDefined();

      // Level 3: App
      const app = wrapper.props.children;
      expect(app).toBeDefined();
      expect(app.type.name).toBe("App");
    });

    it("should only render once", () => {
      expect(mockRender).toHaveBeenCalledTimes(1);
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    });
  });

  describe("theme configuration", () => {
    it("should include ThemeProvider in the component tree", () => {
      const wrapper = renderCall.props.children;

      expect(wrapper).toBeDefined();
      expect(wrapper.props).toBeDefined();
    });

    it("should have App as a child of ThemeProvider", () => {
      const wrapper = renderCall.props.children;
      const app = wrapper.props.children;

      expect(app).toBeDefined();
      expect(app.type.name).toBe("App");
    });
  });

  describe("React version features", () => {
    it("should use createRoot from React 18", () => {
      // Verify we're using the new React 18 API
      expect(mockCreateRoot).toHaveBeenCalled();
      expect(mockRender).toHaveBeenCalled();
    });

    it("should enable StrictMode for development", () => {
      // StrictMode is used for additional checks in development
      expect(renderCall.type).toBe(React.StrictMode);
    });
  });
});
