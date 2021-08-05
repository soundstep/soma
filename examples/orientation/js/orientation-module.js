;(function(undefined) {

	'use strict';

	var OrientationModule = function(emitter) {
		// hold current orientation
		var orientation = detectDeviceOrientation();
		// add listener to detect orientation change
		window.addEventListener('orientationchange', handler);
		// store the new orientation and dispatch an event
		function handler() {
			orientation = detectDeviceOrientation();
			emitter.dispatch('orientation', [orientation]);
		}
		// return the orientation, portait or landscape
		function detectDeviceOrientation() {
			switch(window.orientation) {
				case 90:
				case -90:
					return 'landscape';
				case 0:
				case 180:
				default:
					return 'portrait';
			}
		}
		// return module API
		// getOrientation returns either landscape or portait
		// dispose removes the listener
		return {
			getOrientation: function() {
				return orientation;
			},
			dispose: function() {
				window.removeEventListener('orientationchange', handler);
			}
		};
	};

	OrientationModule.id = 'orientation';

	window.orientationModule = OrientationModule;

})();