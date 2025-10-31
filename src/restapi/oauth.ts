import { restapi } from "./restapi";

const oauthProvider = "google-oauth2";

const LS_LOGIN_NEXT_URI = "next";

export async function loginUser(username: string, password: string) {
  return restapi.post("auth/login/", { username, password });
}

export async function loginGoogle() {
  console.log("Logging in with Google");
  try {
    let currentUrl = window.location.toString();
    const loginUrl =
      window.location.protocol + "//" + window.location.host + "/login";

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
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
      )
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
      const next = localStorage.getItem(LS_LOGIN_NEXT_URI) || "/";
      localStorage.removeItem(LS_LOGIN_NEXT_URI);
      return next;
    } catch (err) {
      console.error("Authentication failed", err);
    }
  }
  return null;
}
