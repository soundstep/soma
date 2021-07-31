declare module soma {

	var version: string;

	declare namespace utils {
		const applyProperties = (target: any, extension: any, bindToExtension: boolean, list?: any[]) => {};
		const augment = (target: any, extension: any, list?: any[]) => {};
		const inherit = (target: any, parent: any) => {};
		const extend = (obj: any) => {};
	}

	export class Emitter {
		addListener(type: string, listener: any, scope?: any, priority?: number):void;
		addListenerOnce(type: string, listener: any, scope?: any, priority?: number):void;
		removeListener(type: string, listener: any, scope?: any, priority?: number):void;
		getSignal(id: string):any;
		dispatch(type: string, params?: any):any;
		dispose():void;
	}

	export class Application {
		injector: infuse.Injector;
		emitter: soma.Emitter;
		commands: soma.Commands;
		mediators: soma.Mediators;
		modules: soma.Modules;
		init():void;
		setup():void;
		dispose():void;
	}
	export class Commands {
		get(commandName: string):any;
		add(commandName: string, command: any):void;
		remove(commandName: string):void;
		dispose():void;
	}
	export class Mediators {
		create(target:any, cl:any):any;
		dispose():void;
	}
}
