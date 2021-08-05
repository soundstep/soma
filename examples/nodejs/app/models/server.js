const express = require('express');
const jsdom = require('jsdom');
const fs = require('fs');
const somaTemplate = require('soma-template');

const { JSDOM } = jsdom;

const Server = function(model, injector, rootDir, PageTemplate) {

	const server = express();

	server.use(express.favicon());
	server.use("/styles", express.static(rootDir + '/static/styles'));

	server.get('/', function(req, res) {
		res.redirect('/node.js');
	});

	server.get('/:path', function(req, res) {

		fs.readFile(rootDir + '/partials/index.html', 'utf8', function (err, data) {
			if (!err) {
				// record path
				model.setPath(req.params.path);
				// create html document
				const dom = new JSDOM(data);
				const document = dom.window.document;
				// create template
				const template = somaTemplate.create(document.body);
				const childInjector = injector.createChild();
				childInjector.mapValue("template", template);
				childInjector.mapValue("scope", template.scope);
				childInjector.createInstance(PageTemplate);
				// result
				res.send(document.documentElement.outerHTML);
			}
		});
	});

	return {
		start: function() {
			server.listen(3000);
			console.log('Server started, visit http://localhost:3000');
		}
	};

};

module.exports = Server;