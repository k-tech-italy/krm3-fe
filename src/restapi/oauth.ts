import { restapi } from "./restapi";

const oauthProvider = "google-oauth2";

const LS_TOKEN_KEY = "Token";
const LS_LOGIN_NEXT_URI = "next";

export function loginUser(username: string, password: string) {
  return restapi.post("jwt/create/", { username, password }).then((res) => {
    localStorage.setItem(LS_TOKEN_KEY, res.data.access);
  });
}

export async function loginGoogle() {
  try {
    localStorage.removeItem(LS_TOKEN_KEY);
    let currentUrl = window.location.toString();
    const loginUrl =
      window.location.protocol + "//" + window.location.host + "/login";
    if (currentUrl.startsWith(loginUrl)) {
      // redirect to home if user goes to /login in the first place
      currentUrl = window.location.protocol + "//" + window.location.host + "/";
    }
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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const token = res.data.access;
      localStorage.setItem(LS_TOKEN_KEY, token);

      // redirect to LS_LOGIN_NEXT_URI or to /
      const next = localStorage.getItem(LS_LOGIN_NEXT_URI) || "/";
      window.location.replace(next);
    } catch (err) {
      localStorage.removeItem(LS_TOKEN_KEY);
    }
  }
}

export function getToken() {
  return localStorage.getItem(LS_TOKEN_KEY);
}
export function clearToken() {
  return localStorage.removeItem(LS_TOKEN_KEY);
}

export function refreshToken() {
  // we currently do not refresh automatically
  // the token is deleted so that a new login will be required
  localStorage.removeItem(LS_TOKEN_KEY);
  // TODO when we get the token there is also a res.data.refresh, we store and use it
}
