///<reference path='../../../../types/soma.d.ts'/>
///<reference path='models/timer.ts'/>
///<reference path='mediators/clock.ts'/>
///<reference path='views/selector.ts'/>
///<reference path='views/clocks/analog/analog.ts'/>
///<reference path='views/clocks/analog/face.ts'/>
///<reference path='views/clocks/analog/needle-hours.ts'/>
///<reference path='views/clocks/analog/needle-minutes.ts'/>
///<reference path='views/clocks/analog/needle-seconds.ts'/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var clock;
(function (clock) {
    var ClockApplication = /** @class */ (function (_super) {
        __extends(ClockApplication, _super);
        function ClockApplication(element) {
            var _this = _super.call(this) || this;
            _this.element = element;
            _this.start();
            return _this;
        }
        ClockApplication.prototype.start = function () {
            // mapping rules
            this.injector.mapClass('timer', clock.TimerModel, true);
            this.injector.mapClass('face', clock.FaceView);
            this.injector.mapClass('needleSeconds', clock.NeedleSeconds);
            this.injector.mapClass('needleMinutes', clock.NeedleMinutes);
            this.injector.mapClass('needleHours', clock.NeedleHours);
            // clock mediator
            this.mediators.create(this.element.querySelector('.clock'), clock.ClockMediator);
            // clock selector template
            var template = soma.template.create(this.element.querySelector('.clock-selector'));
            var childInjector = this.injector.createChild();
            childInjector.mapValue("scope", template.scope);
            childInjector.createInstance(clock.SelectorView);
            // create default view
            this.emitter.dispatch('create', [clock.AnalogView]);
        };
        return ClockApplication;
    }(soma.Application));
    clock.ClockApplication = ClockApplication;
})(clock || (clock = {}));
new clock.ClockApplication(document.querySelector('.clock-app'));
