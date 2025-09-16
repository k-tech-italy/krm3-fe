import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import {
  googleAuthenticate,
  loginGoogle,
  loginUser,
} from "../../restapi/oauth";
import { useMediaQuery } from "../../hooks/useView";
import { useGetCurrentUser } from "../../hooks/useAuth";
import { logout } from "../../restapi/user";
import Krm3Button from "./Krm3Button";
import { User } from "../../restapi/types";

interface LoginError {
  username?: string;
  password?: string;
  detail?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: LoginError;
}

export function Login() {
  const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isAuthenticated } = useGetCurrentUser();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginError>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const values = queryString.parse(location.search);
    const state = values.state ? values.state : null;
    const code = values.code ? values.code : null;
    if (state && code) {
      setIsLoading(true);
      googleAuthenticate(state.toString(), code.toString())
        .then((next) => {
          if (next) {
            navigate(next);
          }
        })
        .catch((err) => {
          console.error("Google authentication failed", err);
          setError({
            detail: "Google authentication failed. Please try again.",
          });
          setShowLogin(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setShowLogin(true);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!(isAuthenticated && data)) {
      // Clear Cookie for issue between new and old version of the app
      logout();
    }
  }, [isAuthenticated, data, navigate]);

  const validateForm = (): ValidationResult => {
    const errors: LoginError = {};
    let isValid = true;

    if (!username) {
      errors.username = "Username is required";
      isValid = false;
    } else if (username.includes("@") && !isValidEmail(username)) {
      errors.username = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    }
    // else if (password.length < 0) {
    //   errors.password = "Password must be at least 6 characters";
    //   isValid = false;
    // }

    return { isValid, errors };
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const { isValid, errors } = validateForm();

    if (!isValid) {
      setError(errors);
      return;
    }

    setIsLoading(true);

    try {
      await loginUser(username, password);
      navigate("/home");
    } catch (err: any) {
      setError({
        detail: err.response?.data?.detail || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "username") {
      setUsername(value);
      setError((prev) => ({ ...prev, username: undefined, detail: undefined }));
    } else if (name === "password") {
      setPassword(value);
      setError((prev) => ({ ...prev, password: undefined, detail: undefined }));
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // window.location.href = '/oauth/login/google-oauth2/';
    loginGoogle()
      .catch((err) => {
        console.error("Failed to initiate Google login", err);
        setError({
          detail: "Failed to connect to Google. Please try again.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoading && !showLogin) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-krm3-primary mx-auto"></div>
          <p className="mt-4">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-5 mx-2 justify-center">
      {showLogin ? (
        <div
          className={`p-5 bg-card shadow-md rounded ${
            isSmallScreen ? "w-full" : "w-1/2"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-app">Login</h2>

          {error?.detail && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:text-red-200 dark:border-red-600"
              role="alert"
            >
              <span className="block sm:inline">{error.detail}</span>
            </div>
          )}

          <form className="flex flex-col" onSubmit={handleLogin} noValidate>
            <div className="mb-4">
              <label htmlFor="username" className="block mb-1 font-medium">
                Username or Email
              </label>
              <input
                data-testid={"username-input"}
                id="username"
                name="username"
                className={`form-control w-full ${
                  !!error?.username ? "border-red-500" : "border-app"
                } border rounded px-3 py-2 text-app bg-card`}
                type="text"
                value={username}
                onChange={handleInputChange}
                autoComplete="username"
                disabled={isLoading}
                aria-invalid={!!error?.username}
                aria-describedby={
                  error?.username ? "username-error" : undefined
                }
              />
              {error?.username && (
                <p className="text-red-500 text-sm mt-1 dark:text-red-300" id="username-error">
                  {error.username}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block mb-1 font-medium">
                Password
              </label>
              <input
                data-testid={"password-input"}
                id="password"
                name="password"
                className={`form-control w-full ${
                  !!error?.password ? "border-red-500" : "border-gray-300"
                } border rounded px-3 py-2`}
                type="password"
                value={password}
                onChange={handleInputChange}
                autoComplete="current-password"
                disabled={isLoading}
                aria-invalid={!!error?.password}
                aria-describedby={
                  error?.password ? "password-error" : undefined
                }
              />
              {error?.password && (
                <p className="text-red-500 text-sm mt-1" id="password-error">
                  {error.password}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Krm3Button
                id={"google-login-button"}
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                style="secondary"
                label={isLoading ? "Processing..." : "Login with Google"}
              />
              <Krm3Button
                id={"login-submit-button"}
                type="submit"
                disabled={isLoading}
                style="primary"
                label={isLoading ? "Logging in..." : "Login"}
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href="/forgot-password"
                className="text-sm text-krm3-primary-dark hover:text-krm3-primary"
              >
                Forgot your password?
              </a>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p>Checking login data...</p>
        </div>
      )}
    </div>
  );
}
