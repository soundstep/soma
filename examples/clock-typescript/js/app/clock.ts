///<reference path='../../../../types/soma.d.ts'/>
///<reference path='models/timer.ts'/>
///<reference path='mediators/clock.ts'/>
///<reference path='views/selector.ts'/>
///<reference path='views/clocks/analog/analog.ts'/>
///<reference path='views/clocks/analog/face.ts'/>
///<reference path='views/clocks/analog/needle-hours.ts'/>
///<reference path='views/clocks/analog/needle-minutes.ts'/>
///<reference path='views/clocks/analog/needle-seconds.ts'/>

module clock {

	export class ClockApplication extends soma.Application {

		public element:HTMLElement;

		constructor(element) {
			super();
			this.element = element;
			this.start();
		}

		start():void {
			// mapping rules
			this.injector.mapClass('timer', TimerModel, true);
			this.injector.mapClass('face', FaceView);
			this.injector.mapClass('needleSeconds', NeedleSeconds);
			this.injector.mapClass('needleMinutes', NeedleMinutes);
			this.injector.mapClass('needleHours', NeedleHours);
			// clock mediator
			this.mediators.create(<HTMLElement>this.element.querySelector('.clock'), ClockMediator);
			// clock selector template
			const template = soma.template.create(this.element.querySelector('.clock-selector'));
			var childInjector = this.injector.createChild();
			childInjector.mapValue("scope", template.scope);
			childInjector.createInstance(clock.SelectorView);
			// create default view
			this.emitter.dispatch('create', [AnalogView]);
		}

	}

}

new clock.ClockApplication(document.querySelector('.clock-app'));