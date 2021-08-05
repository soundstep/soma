;(function(undefined) {

	class Navigation {
		constructor(router, emitter) {
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
		console.log('> dispatching route id:', id);
				emitter.dispatch('show-view', [id]);
			}
		}
	}

	class View {
		constructor(target, emitter) {
			emitter.addListener('show-view', function(params) {
			var isCurrentView = target.className.indexOf(params) !== -1;
			target.style.display = isCurrentView ? 'block' : 'none';
			if (isCurrentView) {
				console.log('  showing the view:', params);
			}
			});
		}
	}

	class Application extends soma.Application {
		init() {
			// create the Director router and make it available through the framework
			this.injector.mapValue('router', new Router());
			// create mediators for the views (DOM Element)
			this.mediators.create([].slice.call(document.querySelectorAll('.view')), View);
			this.start();
		}
		start() {
			// instantiate Navigation to start the app
			this.injector.createInstance(Navigation);
		}
	}

	const app = new Application();


})();
