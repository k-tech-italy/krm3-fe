// Proxy to Django restapi and login urls in dev env only

// @ts-ignore
const { createProxyMiddleware } = require('http-proxy-middleware');
const { b } = require('vitest/dist/chunks/suite.d.FvehnV49.js');

const url = document.location.protocol + '//' + document.location.host;

module.exports = function (app) {
	app.use('/api', createProxyMiddleware({ target: url, changeOrigin: true }));
};

