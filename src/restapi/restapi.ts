import axios from "axios";
import { getToken } from "./oauth";
import applyCaseMiddleware from "axios-case-converter";

export const djSessionId = null;

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

let baseUrl = process.env.KRM3_FE_API_BASE_URL || "/api/v1/";

if (baseUrl.startsWith("/")) {
     baseUrl = document.location.protocol + '//' + document.location.host + baseUrl;
}

export const restapi = applyCaseMiddleware(
  axios.create({
    baseURL: baseUrl, // must include '/api/v1/'
    withCredentials: true,
  })
);
let isRedirecting = false;

restapi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status >= 400 && !isRedirecting) {
      const currentPath = window.location.pathname;

      if (currentPath !== "/login") {
        isRedirecting = true;
        window.location.href = "/login";

        setTimeout(() => {
          isRedirecting = false;
        }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

if (!djSessionId && process.env.NODE_ENV !== "test") {
  // prevent this from being used in tests
  restapi.interceptors.request.use(async (config) => {
    const c = { ...config, headers: config.headers || {} };
    const token = await getToken();
    if (token) {
      c.headers["Authorization"] = `JWT ` + token; //TODO CHECK THIS(ERROR 401)
    }
    return c;
  });
}

if (djSessionId) {
  // set cookie
  document.cookie = `sessionid=${djSessionId}; path=/;`;
} else {
  // clear cookie
  document.cookie =
    "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
