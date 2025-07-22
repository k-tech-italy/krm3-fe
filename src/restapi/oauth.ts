import { restapi } from "./restapi";

const oauthProvider = "google-oauth2";

const LS_TOKEN_KEY = "Token";
const AUTH_COOKIE_KEY = "auth-token";
const LS_LOGIN_NEXT_URI = "next";

function setAuthCookie(token: string | null) {
    if (token) {
        // Set cookie to expire in 7 days, adjust as needed
        const d = new Date();
        d.setTime(d.getTime() + (7*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        document.cookie = `${AUTH_COOKIE_KEY}=${token};${expires};path=/`;
    } else {
        // Delete cookie
        document.cookie = `${AUTH_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
}

export function loginUser(username: string, password: string) {
  return restapi.post("jwt/create/", { username, password }).then((res) => {
    const token = res.data.access;
    localStorage.setItem(LS_TOKEN_KEY, token);
    setAuthCookie(token);
  });
}

export async function loginGoogle() {
  console.log("Logging in with Google");
  try {
    localStorage.removeItem(LS_TOKEN_KEY);
    setAuthCookie(null);
    let currentUrl = window.location.toString();
    const loginUrl =
      window.location.protocol + "//" + window.location.host + "/login";
    // if (currentUrl.startsWith(loginUrl)) {
    //   // redirect to home if user goes to /login in the first place
    //   currentUrl = window.location.protocol + "//" + window.location.host + "/";
    // }
    localStorage.setItem(LS_LOGIN_NEXT_URI, currentUrl);
    const res = await restapi.get(
      `/o/${oauthProvider}/?redirect_uri=${loginUrl}`
    );
    if (!res.data || !res.data.authorizationUrl) {
      console.error("Authorization URL not found in the response");
      window.location.replace("/login");
      return;
    }
    window.location.replace(res.data.authorizationUrl);
  } catch (err) {
    console.log("Error logging in", err); // TODO show a page for errors
    window.location.replace("/login");
  }
}

export async function googleAuthenticate(state: string, code: string) {
  if (state && code && !localStorage.getItem(LS_TOKEN_KEY)) {
    const data: { [key: string]: string } = {
      state: state,
      code: code,
    };
    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
      )
      .join("&");
    try {
      const res = await restapi.post(`/o/google-oauth2/`, formBody, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const token = res.data.access;
      localStorage.setItem(LS_TOKEN_KEY, token);
      setAuthCookie(token);

      // redirect to LS_LOGIN_NEXT_URI or to /
      const next = localStorage.getItem(LS_LOGIN_NEXT_URI) || "/";
      window.location.replace(next);
    } catch (err) {
      localStorage.removeItem(LS_TOKEN_KEY);
      setAuthCookie(null);
    }
  }
}

export function getToken() {
  return localStorage.getItem(LS_TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(LS_TOKEN_KEY);
  setAuthCookie(null);
}

export function refreshToken() {
  // we currently do not refresh automatically
  // the token is deleted so that a new login will be required
  localStorage.removeItem(LS_TOKEN_KEY);
  setAuthCookie(null);
  // TODO when we get the token there is also a res.data.refresh, we store and use it
}
