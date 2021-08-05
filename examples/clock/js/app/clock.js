/*global soma:false*/
(function(clock, soma) {

	'use strict';

	class ClockDemo extends soma.Application {
		constructor(element) {
			super();
			this.element = element;
			this.start();
		}
		start() {
			// mapping rules
			this.injector.mapClass('timer', clock.TimerModel, true);
			this.injector.mapClass('face', clock.FaceView);
			this.injector.mapClass('needleSeconds', clock.NeedleSeconds);
			this.injector.mapClass('needleMinutes', clock.NeedleMinutes);
			this.injector.mapClass('needleHours', clock.NeedleHours);
			// clock mediator
			this.mediators.create(this.element.querySelector('.clock'), clock.ClockMediator);
			// clock selector template
			const template = soma.template.create(this.element.querySelector('.clock-selector'));
			var childInjector = this.injector.createChild();
			childInjector.mapValue("scope", template.scope);
			childInjector.createInstance(clock.SelectorView);
			// create default view
			this.emitter.dispatch('create', [clock.AnalogView]);
		}
	}

	var clockDemo = new ClockDemo(document.querySelector('.clock-app'));


})(window.clock = window.clock || {}, soma);