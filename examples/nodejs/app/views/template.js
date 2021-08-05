const PageTemplate = function(template, scope, model) {

	scope.name = model.getPath();
	scope.links = model.getLinks();
	template.render();

};

module.exports = PageTemplate;
