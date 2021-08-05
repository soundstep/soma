(function(snake) {

	'use strict';

	snake.EndCommand = function(emitter) {

		this.execute = function() {
			// display game over screen or restart game
			emitter.dispatch('start');
		};

	};

})(window.snake = window.snake || {});
