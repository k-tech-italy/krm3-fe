import { restapi } from "./restapi";

const oauthProvider = "google-oauth2";

const LS_LOGIN_NEXT_URI = "next";

export async function loginUser(username: string, password: string) {
  return restapi.post("auth/login/", { username, password });
}

export async function loginGoogle() {
  console.log("Logging in with Google");
  try {
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    const loginUrl = window.location.protocol + "//" + window.location.host + "/login";

    // Store only the relative path so React Router can navigate to it.
    // If the user initiated login from /login itself, fall back to "/" to
    // avoid bouncing back onto the callback page.
    const nextPath = currentPath.startsWith("/login") ? "/" : currentPath;
    localStorage.setItem(LS_LOGIN_NEXT_URI, nextPath);

    const res = await restapi.get(`/o/${oauthProvider}/?redirect_uri=${loginUrl}`);

    if (!res.data || !res.data.authorizationUrl) {
      console.error("Authorization URL not found in the response");
      window.location.replace("/login");
      return;
    }

    window.location.replace(res.data.authorizationUrl);
  } catch (err) {
    console.log("Error logging in", err);
    window.location.replace("/login");
  }
}

export async function googleAuthenticate(state: string, code: string) {
  if (state && code) {
    const data: { [key: string]: string } = {
      state: state,
      code: code,
    };
    const formBody = Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
    try {
      await restapi.post(`/o/google-oauth2/`, formBody, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Session-based auth: user is now logged in via session cookie
      // No need to store tokens in localStorage

      // redirect to LS_LOGIN_NEXT_URI or to /
      const storedNext = localStorage.getItem(LS_LOGIN_NEXT_URI);
      localStorage.removeItem(LS_LOGIN_NEXT_URI);
      // Guard against absolute URLs or login-page bounces; React Router's
      // navigate() expects a path, not a full URL.
      let next = storedNext && storedNext.startsWith("/") ? storedNext : "/";
      if (next.startsWith("/login")) {
        next = "/";
      }
      return next;
    } catch (err) {
      console.error("Authentication failed", err);
    }
  }
  return null;
}
