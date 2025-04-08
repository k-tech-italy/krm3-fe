import axios from 'axios';
import {getToken} from './oauth';
import applyCaseMiddleware from 'axios-case-converter';


// used to temporary bypass Google login
export const djSessionId = null;
// export const djSessionId = 's1xslht0h0vzluoak8v3nzpriq7u2w2p';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
const url = 'http://localhost:8000/api/v1/';

export const restapi = applyCaseMiddleware(axios.create({
    baseURL: url,  // must include '/api/v1/'
}));

restapi.interceptors.response.use(response => {
    return response;
}, (error) => {
    if (error.response && (error.response.status >= 403)) {
        console.warn(error);
        // TODO:
        // - store next url in localhost based on current location
        window.location.replace('/login');
    }

    return Promise.reject(error);
});

if (!djSessionId && (process.env.NODE_ENV !== "test")) {  // prevent this from being used in tests
    restapi.interceptors.request.use(async config => {
        const c = {...config, headers: config.headers || {}};
        const token = await getToken();
        if (token) {
            c.headers['Authorization'] = `JWT ` + token;//TODO CHECK THIS(ERROR 401)
        }
        return c;
    });
}

if (djSessionId) {  // set cookie
    document.cookie = `sessionid=${djSessionId}; path=/;`;
} else {  // clear cookie
    document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
