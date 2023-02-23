// Proxy to Django restapi and login urls in dev env only

// @ts-ignore
const proxy = require('http-proxy-middleware');

// const djangoUrl = 'https://krm3.k-tech-it/';  // Local
const djangoUrl = 'http://localhost:8000/';  // Local

module.exports = function (app) {
	app.use(proxy('/v1/api', {target: djangoUrl, changeOrigin: true}));
};
