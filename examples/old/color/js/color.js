;(function(undefined) {

	'use strict';

	var ColorModel = function(emitter) {

		emitter.addListener('all', changeColor, undefined, 1);
		emitter.addListener('others', changeColor, undefined, 1);

		var color = getRandomColor();

		function getRandomColor() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++ ) {
				color += letters[Math.round(Math.random() * 15)];
			}
			return color;
		}

		function changeColor(event) {
			color = getRandomColor();
		}

		return {
			getColor: function() {
				return color;
			}
		};
	};

	var ContainerMediator = function(target, mediators) {
		for (var i=0; i<20; i++) {
			$(target).append('<div class="widget" data-id="' + i + '"><button class="all">Change All</button><button class="others">Change Others</button></div>');
		}
		mediators.create($('.widget').toArray(), WidgetMediator);
	};

	var WidgetMediator = function(target, emitter, colorModel) {
		var id = $(target).attr('data-id');
		emitter.addListener('all', allHandler);
		emitter.addListener('others', othersHandler);
		$('.all', target).click(function() {
			emitter.dispatch('all');
		});
		$('.others', target).click(function() {
			emitter.dispatch('others', [id]);
		});
		function allHandler() {
			$(target).css('background-color', colorModel.getColor());
		}
		function othersHandler(params) {
			if (id !== params) {
				$(target).css('background-color', colorModel.getColor());
			}
		}
	};

	var App = soma.Application.extend({
		init: function() {
			this.injector.mapClass('colorModel', ColorModel, true);
			this.mediators.create($('.container'), ContainerMediator);
		}
	});

	var app = new App();

})();
