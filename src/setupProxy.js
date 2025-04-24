// Proxy to Django restapi and login urls in dev env only

// @ts-ignore
const { createProxyMiddleware } = require('http-proxy-middleware');
const { b } = require('vitest/dist/chunks/suite.d.FvehnV49.js');

//const djangoUrl = 'https://krm3int.k-tech-it/';  // Local
const baseUrl = process.env.KRM3_FE_API_BASE_URL
const url = baseUrl.replace("/api/v1/", "/");

module.exports = function (app) {
	app.use('/api', createProxyMiddleware({ target: url, changeOrigin: true }));
};

