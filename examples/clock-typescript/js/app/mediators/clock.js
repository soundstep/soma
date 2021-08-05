///<reference path='../../../../../types/soma.d.ts'/>
///<reference path='../models/timer.ts'/>
///<reference path='../interfaces/ITimer.ts'/>
///<reference path='../interfaces/IClockView.ts'/>
var clock;
(function (clock) {
    var ClockMediator = /** @class */ (function () {
        function ClockMediator(target, emitter, mediators, timer) {
            emitter.addListener('create', function (MediatorClass) {
                // destroy previous clock
                if (this.currentClock) {
                    timer.remove(this.currentClock.update);
                    this.currentClock.dispose();
                }
                // create clock
                this.currentClock = mediators.create(target, MediatorClass);
                this.currentClockUpdateMethod = this.currentClock.update.bind(this.currentClock);
                // register clock with timer model
                timer.add(this.currentClockUpdateMethod);
                this.currentClock.update(timer.time);
            });
        }
        return ClockMediator;
    }());
    clock.ClockMediator = ClockMediator;
})(clock || (clock = {}));
