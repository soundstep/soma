///<reference path='../../../../../types/soma.d.ts'/>

module clock {

	export class SelectorView {

		constructor(scope:any, emitter:soma.Emitter) {
			scope.select = function (event, id) {
				emitter.dispatch('create', [clock[id]]);
			}.bind(this);
		}

	}

}
