(function(clock) {

	'use strict';

    var SelectorView = function(scope, emitter) {

		var views = {
			'digital': clock.DigitalView,
			'analog': clock.AnalogView,
			'polar': clock.PolarView
		};

		scope.select = function(event, id) {
			emitter.dispatch('create', [views[id]]);
		};

    };

	clock.SelectorView = SelectorView;

})(window.clock = window.clock || {});