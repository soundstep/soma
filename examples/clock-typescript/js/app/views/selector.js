///<reference path='../../../../../types/soma.d.ts'/>
var clock;
(function (clock) {
    var SelectorView = /** @class */ (function () {
        function SelectorView(scope, emitter) {
            scope.select = function (event, id) {
                emitter.dispatch('create', [clock[id]]);
            }.bind(this);
        }
        return SelectorView;
    }());
    clock.SelectorView = SelectorView;
})(clock || (clock = {}));
