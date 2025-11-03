import axios from "axios";
import applyCaseMiddleware from "axios-case-converter";

// Configure CSRF token handling for Django
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

let baseUrl = process.env.KRM3_FE_API_BASE_URL || "/api/v1/";

if (typeof document !== 'undefined' && baseUrl.startsWith("/")) {
     baseUrl = document.location.protocol + '//' + document.location.host + baseUrl;
}

export const restapi = applyCaseMiddleware(
  axios.create({
    baseURL: baseUrl, // must include '/api/v1/'
    withCredentials: true, // Important: sends session cookies with requests
  })
);

let isRedirecting = false;

// Redirect to login on 401 Unauthorized
restapi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401 && !isRedirecting) {
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
