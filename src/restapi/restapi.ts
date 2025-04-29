import axios from "axios";
import applyCaseMiddleware from "axios-case-converter";

export const djSessionId = null;

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const baseUrl = process.env.KRM3_FE_API_BASE_URL;

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
    if (error.response?.status === 401 && !isRedirecting) {
      const currentPath = window.location.pathname;

      // Verifica di non essere già sulla pagina di login
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


if (djSessionId) {
  // set cookie
  document.cookie = `sessionid=${djSessionId}; path=/;`;
} else {
  // clear cookie
  document.cookie =
    "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
