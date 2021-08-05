;(function(undefined) {

	'use strict';

	class View {
		constructor(target, emitter, orientation) {
			// display the orientation when the view is created
			updateOrientation(orientation.getOrientation());
			// listen to the event dispatched by the plugin
			emitter.addListener('orientation', function(direction) {
				// display the orientation when a change happened
				updateOrientation(direction);
			});
			// display the orientation in the DOM Element
			function updateOrientation(value) {
				target.innerHTML = 'Current orientation: ' + value;
			}
		}
	}

	class Application extends soma.Application {
		init() {
			// create the plugin
			var orientation = this.modules.create(window.orientationModule);
			// create a mapping rule
			this.injector.mapValue('orientation', orientation);
			this.start();
		}
		start() {
			// create a view
			this.mediators.create(document.querySelector('.report'), View);
		}
	}

	var app = new Application();

})();