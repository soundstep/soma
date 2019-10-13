/*global soma:false*/
(function(clock, soma) {

	'use strict';

	var ClockDemo = soma.Application.extend({
		constructor: function(element) {
			this.element = element;
			soma.Application.call(this);
		},
		init: function() {
			// mapping rules
			this.injector.mapClass('timer', clock.TimerModel, true);
			this.injector.mapClass('face', clock.FaceView);
			this.injector.mapClass('needleSeconds', clock.NeedleSeconds);
			this.injector.mapClass('needleMinutes', clock.NeedleMinutes);
			this.injector.mapClass('needleHours', clock.NeedleHours);
			// clock mediator
			this.mediators.create(this.element.querySelector('.clock'), clock.ClockMediator);
			// clock selector template
			new soma.template.Plugin(this, this.injector);
			this.createTemplate(clock.SelectorView, this.element.querySelector('.clock-selector'));
		},
		start: function() {
			this.emitter.dispatch('create', [clock.AnalogView]);
		}
	});

	var clockDemo = new ClockDemo(document.querySelector('.clock-app'));

	clockDemo.start();

})(window.clock = window.clock || {}, soma);
