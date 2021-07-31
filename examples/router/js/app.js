;(function(undefined) {

	var Navigation = function(router, emitter) {

		'use strict';

		// setup routes and dispatch views ids

		router.on('/home', function() {
			dispatchRoute('home');
		});

		router.on('/page1', function() {
			dispatchRoute('page1');
		});

		router.on('/page2', function() {
			dispatchRoute('page2');
		});

		// in this demo, all routes could have been handled with this single regex route
		// router.on(/.*/, function() {
		//   dispatchRoute(router.getRoute()[0]);
		// });

		router.init('/home');

		function dispatchRoute(id) {
			emitter.dispatch('show-view', [id]);
		}

	};

	var View = function(target, emitter) {
		emitter.addListener('show-view', function(params) {
			var isCurrentView = target.className.indexOf(params) !== -1;
			target.style.display = isCurrentView ? 'block' : 'none';
		});
	};

	var Application = soma.Application.extend({
		init: function() {
			// create the Director router and make it available through the framework
			this.injector.mapValue('router', new Router());
			// create mediators for the views (DOM Element)
			this.mediators.create([].slice.call(document.querySelectorAll('.view')), View);
		},
		start: function() {
			// instantiate Navigation to start the app
			this.injector.createInstance(Navigation);
		}
	});

	var app = new Application();
	app.start();

})();