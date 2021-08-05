;(function(undefined) {

	'use strict';

	class Model {
		getData() {
			return "Hello soma.js!";
		}
	}

	class Mediator {
		constructor(target, emitter, model) {
			emitter.addListener('show-hello-world', function() {
				target.innerHTML = model.getData();
			});
		}
	}

	class App extends soma.Application {
		init() {
			this.injector.mapClass('model', Model, true);
			this.mediators.create(document.getElementById('message'), Mediator);
			this.start();
		}
		start() {
			this.emitter.dispatch('show-hello-world');
		}
	}

	var app = new App();

})();