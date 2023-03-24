import axios from 'axios';
import { getToken } from './oauth';


// used to temporary bypass Google login
export const djSessionId = null;
// export const djSessionId = 's1xslht0h0vzluoak8v3nzpriq7u2w2p';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export const restapi = axios.create({
	baseURL: process.env.REACT_APP_REST_API_BASE_URL,  // must include '/api/v1/'
});

restapi.interceptors.response.use(response => {
	return response;
}, (error) => {
	if (error.response && error.response.status === 403) {
		console.warn('403 Restapi connection forbidden', error);
		// TODO:
		// - store next url in localhost based on current location
		// - redirect to /login FE page
	}
	return Promise.reject(error);
});

if (!djSessionId && (process.env.NODE_ENV !== "test")) {  // prevent this from being used in tests
	restapi.interceptors.request.use(async config => {
		const c = {...config, headers: config.headers || {}};
		const token = getToken();
		console.log('TOKEN is ', token);
		if (token) {
			c.headers['Authorization'] = `JWT ${token}`;
		}
		return c;
	});
}

if (djSessionId) {  // set cookie
	document.cookie = `sessionid=${djSessionId}; path=/;`;
} else {  // clear cookie
	document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
