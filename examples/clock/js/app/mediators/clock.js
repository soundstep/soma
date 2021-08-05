(function(clock) {

	'use strict';

	var ClockMediator = function(target, emitter, mediators, timer) {

		var currentClock;

		emitter.addListener('create', function(MediatorClass) {

			// destroy previous clock
			if (currentClock) {
				timer.remove(currentClock.update);
				currentClock.dispose();
			}

			// create clock
			currentClock = mediators.create(target, MediatorClass);

			// register clock with timer model
			timer.add(currentClock.update);
			currentClock.update(timer.time);

		});

	};

	clock.ClockMediator = ClockMediator;

})(window.clock = window.clock || {});