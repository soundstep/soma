/*
Copyright (c) | 2013 | infuse.js | Romuald Quantin | www.soundstep.com | romu@soundstep.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(infuse) {

    'use strict';

	infuse.version = '0.6.9';

	// regex from angular JS (https://github.com/angular/angular.js)
	var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
	var FN_ARG_SPLIT = /,/;
	var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

	if(!Array.prototype.contains) {
		Array.prototype.contains = function(value) {
			var i = this.length;
			while (i--) {
				if (this[i] === value) {
					return true;
				}
			}
			return false;
		};
	}

	infuse.InjectorError = {
		MAPPING_BAD_PROP: '[Error infuse.Injector.mapClass/mapValue] the first parameter is invalid, a string is expected',
		MAPPING_BAD_VALUE: '[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, it can\'t null or undefined, with property: ',
		MAPPING_BAD_CLASS: '[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, a function is expected, with property: ',
		MAPPING_BAD_SINGLETON: '[Error infuse.Injector.mapClass] the third parameter is invalid, a boolean is expected, with property: ',
		MAPPING_ALREADY_EXISTS: '[Error infuse.Injector.mapClass/mapValue] this mapping already exists, with property: ',
		CREATE_INSTANCE_INVALID_PARAM: '[Error infuse.Injector.createInstance] invalid parameter, a function is expected',
		NO_MAPPING_FOUND: '[Error infuse.Injector.getInstance] no mapping found',
		INJECT_INSTANCE_IN_ITSELF_PROPERTY: '[Error infuse.Injector.getInjectedValue] A matching property has been found in the target, you can\'t inject an instance in itself',
		INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR: '[Error infuse.Injector.getInjectedValue] A matching constructor parameter has been found in the target, you can\'t inject an instance in itself'
	};

	var MappingVO = function(prop, value, cl, singleton) {
		this.prop = prop;
		this.value = value;
		this.cl = cl;
		this.singleton = singleton || false;
	};

	var validateProp = function(prop) {
		if (typeof prop !== 'string') {
			throw new Error(infuse.InjectorError.MAPPING_BAD_PROP);
		}
	};

	var validateValue = function(prop, val) {
		if (val === undefined || val === null) {
			throw new Error(infuse.InjectorError.MAPPING_BAD_VALUE + prop);
		}
	};

	var validateClass = function(prop, val) {
		if (typeof val !== 'function') {
			throw new Error(infuse.InjectorError.MAPPING_BAD_CLASS + prop);
		}
	};

	var validateBooleanSingleton = function(prop, singleton) {
		if (typeof singleton !== 'boolean') {
			throw new Error(infuse.InjectorError.MAPPING_BAD_SINGLETON + prop);
		}
	};

	var validateConstructorInjectionLoop = function(name, cl) {
		var params = infuse.getConstructorParams(cl);
		if (params.contains(name)) {
			throw new Error(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
		}
	};

	var validatePropertyInjectionLoop = function(name, target) {
		if (target.hasOwnProperty(name)) {
			throw new Error(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
		}
	};

	infuse.Injector = function() {
		this.mappings = {};
		this.parent = null;
	};

	infuse.getConstructorParams = function(cl) {
		var args = [];
		function extractName(all, underscore, name) {
			args.push(name);
		}
		var clStr = cl.toString().replace(STRIP_COMMENTS, '');
		var argsFlat = clStr.match(FN_ARGS);
		var spl = argsFlat[1].split(FN_ARG_SPLIT);
		for (var i=0; i<spl.length; i++) {
			var arg = spl[i];
			arg.replace(FN_ARG, extractName);
		}
		return args;
	};

	infuse.Injector.prototype = {

		createChild: function() {
			var injector = new infuse.Injector();
			injector.parent = this;
			return injector;
		},

		getMappingVo: function(prop) {
			if (!this.mappings) {
				return null;
			}
			if (this.mappings[prop]) {
				return this.mappings[prop];
			}
			if (this.parent) {
				return this.parent.getMappingVo(prop);
			}
			return null;
		},

		mapValue: function(prop, val) {
			if (this.mappings[prop]) {
				throw new Error(infuse.InjectorError.MAPPING_ALREADY_EXISTS + prop);
			}
			validateProp(prop);
			validateValue(prop, val);
			this.mappings[prop] = new MappingVO(prop, val, undefined, undefined);
			return this;
		},

		mapClass: function(prop, cl, singleton) {
			if (this.mappings[prop]) {
				throw new Error(infuse.InjectorError.MAPPING_ALREADY_EXISTS + prop);
			}
			validateProp(prop);
			validateClass(prop, cl);
			if (singleton) {
				validateBooleanSingleton(prop, singleton);
			}
			this.mappings[prop] = new MappingVO(prop, null, cl, singleton);
			return this;
		},

		removeMapping: function(prop) {
			this.mappings[prop] = null;
			delete this.mappings[prop];
			return this;
		},

		hasMapping: function(prop) {
			return !!this.mappings[prop];
		},

		hasInheritedMapping: function(prop) {
			return !!this.getMappingVo(prop);
		},

		getMapping: function(value) {
			for (var name in this.mappings) {
				if (this.mappings.hasOwnProperty(name)) {
					var vo = this.mappings[name];
					if (vo.value === value || vo.cl === value) {
						return vo.prop;
					}
				}
			}
			return undefined;
		},

		getValue: function(prop) {
			var vo = this.mappings[prop];
			if (!vo) {
				if (this.parent) {
					return this.parent.getValue.apply(this.parent, arguments);
				}
				else {
					throw new Error(infuse.InjectorError.NO_MAPPING_FOUND);
				}
			}
			if (vo.cl) {
				var args = Array.prototype.slice.call(arguments);
				args[0] = vo.cl;
				if (vo.singleton) {
					if (!vo.value) {
						vo.value = this.createInstance.apply(this, args);
					}
					return vo.value;
				}
				else {
					return this.createInstance.apply(this, args);
				}
			}
			return vo.value;
		},

		getClass: function(prop) {
			var vo = this.mappings[prop];
			if (!vo) {
				if (this.parent) {
					return this.parent.getClass(prop);
				}
				else {
					return undefined;
				}
			}
			if (vo.cl) {
				return vo.cl;
			}
			return undefined;
		},

		instantiate: function(TargetClass) {
			if (typeof TargetClass !== 'function') {
				throw new Error(infuse.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
			}
			var args = [null];
			var params = infuse.getConstructorParams(TargetClass);
			for (var i=0; i<params.length; i++) {
				if (arguments[i+1] !== undefined && arguments[i+1] !== null) {
					// argument found
					args.push(arguments[i+1]);
				}
				else {
					var name = params[i];
					// no argument found
					var vo = this.getMappingVo(name);
					if (!!vo) {
						// found mapping
						var val = this.getInjectedValue(vo, name);
						args.push(val);
					}
					else {
						// no mapping found
						args.push(undefined);
					}
				}
			}
			return new (Function.prototype.bind.apply(TargetClass, args))();
		},

		inject: function (target, isParent) {
			if (this.parent) {
				this.parent.inject(target, true);
			}
			for (var name in this.mappings) {
				if (this.mappings.hasOwnProperty(name)) {
					var vo = this.getMappingVo(name);
					if (target.hasOwnProperty(vo.prop) || (target.constructor && target.constructor.prototype && target.constructor.prototype.hasOwnProperty(vo.prop)) ) {
						target[name] = this.getInjectedValue(vo, name);
					}
				}
			}
			if (typeof target.postConstruct === 'function' && !isParent) {
				target.postConstruct();
			}
			return this;
		},

		getInjectedValue: function(vo, name) {
			var val = vo.value;
			var injectee;
			if (vo.cl) {
				if (vo.singleton) {
					if (!vo.value) {
						validateConstructorInjectionLoop(name, vo.cl);
						vo.value = this.instantiate(vo.cl);
						injectee = vo.value;
					}
					val = vo.value;
				}
				else {
					validateConstructorInjectionLoop(name, vo.cl);
					val = this.instantiate(vo.cl);
					injectee = val;
				}
			}
			if (injectee) {
				validatePropertyInjectionLoop(name, injectee);
				this.inject(injectee);
			}
			return val;
		},

		createInstance: function() {
			var instance = this.instantiate.apply(this, arguments);
			this.inject(instance);
			return instance;
		},

		getValueFromClass: function(cl) {
			for (var name in this.mappings) {
				if (this.mappings.hasOwnProperty(name)) {
					var vo = this.mappings[name];
					if (vo.cl === cl) {
						if (vo.singleton) {
							if (!vo.value) {
								vo.value = this.createInstance.apply(this, arguments);
							}
							return vo.value;
						}
						else {
							return this.createInstance.apply(this, arguments);
						}
					}
				}
			}
			if (this.parent) {
				return this.parent.getValueFromClass.apply(this.parent, arguments);
			} else {
				throw new Error(infuse.InjectorError.NO_MAPPING_FOUND);
			}
		},

		dispose: function() {
			this.mappings = {};
		}

	};

	if (!Function.prototype.bind) {
		Function.prototype.bind = function bind(that) {
			var target = this;
			if (typeof target !== 'function') {
				throw new Error('Error, you must bind a function.');
			}
			var args = Array.prototype.slice.call(arguments, 1); // for normal call
			var bound = function () {
				if (this instanceof bound) {
					var F = function(){};
					F.prototype = target.prototype;
					var self = new F();
					var result = target.apply(
						self,
						args.concat(Array.prototype.slice.call(arguments))
					);
					if (Object(result) === result) {
						return result;
					}
					return self;
				} else {
					return target.apply(
						that,
						args.concat(Array.prototype.slice.call(arguments))
					);
				}
			};
			return bound;
		};
	}

	// register for AMD module
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define("infuse", infuse);
	}

	// export for node.js
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = infuse;
	}
	if (typeof exports !== 'undefined') {
		exports = infuse;
	}

})(this['infuse'] = this['infuse'] || {});

/*
Copyright (c) | 2013 | soma-events | Romuald Quantin | www.soundstep.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function (soma) {

	'use strict';

	soma.events = {};
	soma.events.version = '0.5.6';

    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(that) {
            var target = this;
            if (typeof target !== 'function') {
                throw new Error('Error, you must bind a function.');
            }
            var args = Array.prototype.slice.call(arguments, 1); // for normal call
            var bound = function () {
                if (this instanceof bound) {
                    var F = function(){};
                    F.prototype = target.prototype;
                    var self = new F();
                    var result = target.apply(
                        self,
                        args.concat(Array.prototype.slice.call(arguments))
                    );
                    if (Object(result) === result) {
                        return result;
                    }
                    return self;
                } else {
                    return target.apply(
                        that,
                        args.concat(Array.prototype.slice.call(arguments))
                    );
                }
            };
            return bound;
        };
    }

	soma.Event = function (type, params, bubbles, cancelable) {
		var e = soma.Event.createGenericEvent(type, bubbles, cancelable);
		if (params !== null && params !== undefined) {
			e.params = params;
		}
		e.isCloned = false;
		e.clone = this.clone.bind(e);
		e.isIE9orIE10 = this.isIE9orIE10;
		e.isDefaultPrevented = this.isDefaultPrevented;
		if (this.isIE9orIE10() || !e.preventDefault || (e.getDefaultPrevented === undefined && e.defaultPrevented === undefined )) {
			e.preventDefault = this.preventDefault.bind(e);
		}
		if (this.isIE9orIE10()) {
			e.IE9or10PreventDefault = false;
		}
		return e;
	};

	soma.Event.prototype.clone = function () {
		var e = soma.Event.createGenericEvent(this.type, this.bubbles, this.cancelable);
		e.params = this.params;
		e.isCloned = true;
		e.clone = this.clone;
		e.isDefaultPrevented = this.isDefaultPrevented;
		e.isIE9orIE10 = this.isIE9orIE10;
		if (this.isIE9orIE10()) {
			e.IE9or10PreventDefault = this.IE9or10PreventDefault;
		}
		return e;
	};

	soma.Event.prototype.preventDefault = function () {
		if (!this.cancelable) {
			return false;
		}
		if (this.isIE9orIE10()) {
			this.IE9or10PreventDefault = true;
		}
		else {
			this.defaultPrevented = true;
		}
		return this;
	};

	soma.Event.prototype.isDefaultPrevented = function () {
		if (!this.cancelable) {
			return false;
		}
		if (this.isIE9orIE10()) {
			return this.IE9or10PreventDefault;
		}
		if (this.defaultPrevented !== undefined) {
			return this.defaultPrevented;
		} else if (this.getDefaultPrevented !== undefined) {
			return this.getDefaultPrevented();
		}
		return false;
	};

	soma.Event.createGenericEvent = function (type, bubbles, cancelable) {
		var event;
		bubbles = bubbles !== undefined ? bubbles : true;
		if (typeof document === 'object' && document.createEvent) {
			event = document.createEvent('Event');
			event.initEvent(type, !!bubbles, !!cancelable);
		} else if (typeof document === 'object' && document.createEventObject) {
			event = document.createEventObject();
			event.type = type;
			event.bubbles = !!bubbles;
			event.cancelable = !!cancelable;
		} else {
			event = new EventObject(type, !!bubbles, !!cancelable);
		}
		return event;
	};

	soma.Event.prototype.isIE9orIE10 = function() {
        if (typeof document !== 'object') {
			return false;
        }
		return (document.body.style.scrollbar3dLightColor !== undefined && document.body.style.opacity !== undefined) || document.body.style.msTouchAction !== undefined;
    };

	soma.Event.prototype.toString = function() {
		return '[soma.Event]';
	};

	var EventObject = function(type, bubbles, cancelable) {
		this.type = type;
		this.bubbles = !!bubbles;
		this.cancelable = !!cancelable;
		this.defaultPrevented = false;
		this.currentTarget = null;
		this.target = null;
	};

	soma.EventDispatcher = function () {
		this.listeners = [];
	};

	soma.EventDispatcher.prototype.addEventListener = function(type, listener, priority) {
		if (!this.listeners || !type || !listener) {
			return;
		}
		if (isNaN(priority)) {
			priority = 0;
		}
		for (var i=0; i<this.listeners.length; i++) {
			var eventObj = this.listeners[i];
			if (eventObj.type === type && eventObj.listener === listener) {
				return;
			}
		}
		this.listeners.push({type: type, listener: listener, priority: priority, scope:this});
	};

	soma.EventDispatcher.prototype.removeEventListener = function(type, listener) {
		if (!this.listeners || !type || !listener) {
			return;
		}
		var i = this.listeners.length;
		while(i-- > 0) {
			var eventObj = this.listeners[i];
			if (eventObj.type === type && eventObj.listener === listener) {
				this.listeners.splice(i, 1);
			}
		}
	};

	soma.EventDispatcher.prototype.hasEventListener = function(type) {
		if (!this.listeners || !type) {
			return false;
		}
		var i = 0;
		var l = this.listeners.length;
		for (; i < l; ++i) {
			var eventObj = this.listeners[i];
			if (eventObj.type === type) {
				return true;
			}
		}
		return false;
	};

	soma.EventDispatcher.prototype.dispatchEvent = function(event) {
		if (!this.listeners || !event) {
			throw new Error('Error in EventDispatcher (dispatchEvent), one of the parameters is null or undefined.');
		}
		var events = [];
		var i;
		for (i = 0; i < this.listeners.length; i++) {
			var eventObj = this.listeners[i];
			if (eventObj.type === event.type) {
				events.push(eventObj);
			}
		}
		events.sort(function(a, b) {
			return b.priority - a.priority;
		});
		for (i = 0; i < events.length; i++) {
			events[i].listener.apply((event.srcElement) ? event.srcElement : event.currentTarget, [event]);
		}
		return !event.isDefaultPrevented();
	};

	soma.EventDispatcher.prototype.dispatch = function(type, params, bubbles, cancelable) {
		if (!this.listeners || !type || type === '') {
			throw new Error('Error in EventDispatcher (dispatch), one of the parameters is null or undefined.');
		}
		var event = new soma.Event(type, params, bubbles, cancelable);
		this.dispatchEvent(event);
		return event;
	};

	soma.EventDispatcher.prototype.dispose = function() {
		this.listeners = null;
	};

	soma.EventDispatcher.prototype.toString = function() {
		return '[soma.EventDispatcher]';
	};

	// register for AMD module
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define("soma-events", soma);
	}

	// export for node.js
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = soma;
	}
	if (typeof exports !== 'undefined') {
		exports = soma;
	}

})(this['soma'] = this['soma'] || {});


(function (soma, infuse) {

	'use strict';

	soma.version = '2.0.4';

	soma.applyProperties = function(target, extension, bindToExtension, list) {
		if (Object.prototype.toString.apply(list) === '[object Array]') {
			for (var i = 0, l = list.length; i < l; i++) {
				if (target[list[i]] === undefined || target[list[i]] === null) {
					if (bindToExtension && typeof extension[list[i]] === 'function') {
						target[list[i]] = extension[list[i]].bind(extension);
					}
					else {
						target[list[i]] = extension[list[i]];
					}
				}
			}
		}
		else {
			for (var prop in extension) {
				if (bindToExtension && typeof extension[prop] === 'function') {
					target[prop] = extension[prop].bind(extension);
				}
				else {
					target[prop] = extension[prop];
				}
			}
		}
	};

	soma.augment = function (target, extension, list) {
		if (!extension.prototype || !target.prototype) {
			return;
		}
		if (Object.prototype.toString.apply(list) === '[object Array]') {
			for (var i = 0, l = list.length; i < l; i++) {
				if (!target.prototype[list[i]]) {
					target.prototype[list[i]] = extension.prototype[list[i]];
				}
			}
		}
		else {
			for (var prop in extension.prototype) {
				if (!target.prototype[prop]) {
					target.prototype[prop] = extension.prototype[prop];
				}
			}
		}
	};

	soma.inherit = function (parent, obj) {
		var Subclass;
		if (obj && obj.hasOwnProperty('constructor')) {
			// use constructor if defined
			Subclass = obj.constructor;
		} else {
			// call the super constructor
			Subclass = function () {
				return parent.apply(this, arguments);
			};
		}
		// set the prototype chain to inherit from the parent without calling parent's constructor
		var Chain = function(){};
		Chain.prototype = parent.prototype;
		Subclass.prototype = new Chain();
		// add obj properties
		if (obj) {
			soma.applyProperties(Subclass.prototype, obj);
		}
		// point constructor to the Subclass
		Subclass.prototype.constructor = Subclass;
		// set super class reference
		Subclass.parent = parent.prototype;
		// add extend shortcut
		Subclass.extend = function (obj) {
			return soma.inherit(Subclass, obj);
		};
		return Subclass;
	};

	soma.extend = function (obj) {
		return soma.inherit(function () {
		}, obj);
	};

	soma.browsers = soma.browsers || {};
	soma.browsers.ie = (function () {

		if (typeof document === 'undefined') {
			return undefined;
		}

		var div = document.createElement('div');

		if (typeof div.style.msTouchAction !== 'undefined') {
			return 10;
		}

		var v = 3, all = div.getElementsByTagName('i');

		while (
			div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
				all[0]
			);

		return v > 4 ? v : undefined;

	}());

	soma.utils = soma.utils || {};
	soma.utils.HashMap = function(id) {
		var items = {};
		var count = 0;
		//var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}
		function uuid() { return ++count + id; }
		function getKey(target) {
			if (!target) {
				return;
			}
			if (typeof target !== 'object') {
				return target;
			}
			var result;
			try {
				// IE 7-8 needs a try catch, seems like I can't add a property on text nodes
				result = target[id] ? target[id] : target[id] = uuid();
			} catch(err){}
			return result;
		}
		this.remove = function(key) {
			delete items[getKey(key)];
		};
		this.get = function(key) {
			return items[getKey(key)];
		};
		this.put = function(key, value) {
			items[getKey(key)] = value;
		};
		this.has = function(key) {
			return typeof items[getKey(key)] !== 'undefined';
		};
		this.getData = function() {
			return items;
		};
		this.dispose = function() {
			for (var key in items) {
				if (items.hasOwnProperty(key)) {
					delete items[key];
				}
			}
			this.length = 0;
		};
	}

	function parseDOM(self, element, updateData) {
		if (!element || !element.nodeType || element.nodeType === 8 || element.nodeType === 3 || typeof element['getAttribute'] === 'undefined') {
			return;
		}
		for (var typeId in self.types) {
			var type = self.types[typeId];
			var name = type.name;
			var attrValue = element.getAttribute(name);
			if (attrValue !== undefined && attrValue !== null && attrValue !== '') {
				var mediatorId = attrValue.split(self.attributeSeparator)[0];
				var mapping = type.getMapping(mediatorId);
				if (mapping) {
					var dataSource = getDataSource(self, element, type, attrValue);
					if (!type.get(element)) {
						type.add(element, self.create(type.mappings[mediatorId].mediator, element, dataSource));
					}
					else {
						if (updateData) {
							updateMediatorData(self, type, attrValue, element);
						}
					}
				}
			}
		}
		var child = element.firstChild;
		while (child) {
			parseDOM(self, child, updateData);
			child = child.nextSibling;
		}
	}

	var regexFunction = /(.*)\((.*)\)/;
	var regexParams = /^(\"|\')(.*)(\"|\')$/;

	function parsePath(dataValue, dataPath) {
		console.log('======= PARSE DATA VALUE');
		console.log('======= dataValue', dataValue);
		console.log('======= dataPath', dataPath);
		if (dataPath !== undefined && dataValue !== undefined) {
			var val = dataValue;
			var path = dataPath.split('.');
			var step = path.shift();
			while (step !== undefined) {
				var parts = step.match(regexFunction);
				if (parts) {
					var params = parts[2];
					params = params.replace(/,\s+/g, '').split(',');
					for (var i=0, l=params.length; i<l; i++) {
						if (regexParams.test(params[i])) {
							params[i] = params[i].substr(1, params[i].length-2);
						}
					}
					if (val[parts[1]] !== undefined) {
						val = val[parts[1]].apply(null, params);
					}
				}
				else {
					val = val[step];
				}
				console.log('VAL', val);
				if (val === undefined || val === undefined) {
					break;
				}
				step = path.shift()
			}
			dataValue = val;
		}
		return dataValue;
	}

	function parsePathParent(self, element, dataPath) {
		console.log('-------------');
		var result;
		var el = element.parentNode;
		while (el) {

			console.log('element', el);
			console.log('dataPath', dataPath);

			// do something

//			result = parsePath(dataValue, dataPath, self, el);

			//console.log('TYPES', self.types);


			for (var typeId in self.types) {
				var type = self.types[typeId];
				console.log('type', type);
				console.log('type.name', type.name);
				console.log('mediator', type.get(el));
				console.log('mediator', type.list.get(el));

				var listData = type.list.getData();

				for (var m in listData) {
					console.log(m, listData[m]);
				}

				var attrValue = el.getAttribute(type.name);
				if (attrValue) {

					var parts = attrValue.split(self.attributeSeparator);
					var mediatorId = parts[0];

					return resolveDataSource(self, el, type, mediatorId, dataPath);

					console.log('RES', result);

					//result = parsePath(dataSource, dataPath, self, el);

					if (result !== undefined) {
						break;
					}

				}

//				if (result !== undefined) {
//					return result;
//				}

			}

			console.log('PARENT RESULT', result);

			if (result !== undefined) {
				return result;
			}
			else {
				return parsePathParent(self, el, dataPath);
			}
//


			el = el.nextSibling;
		}
	}

	function getDataSource(self, element, type, attrValue) {
		var dataSource;
		var parts = attrValue.split(self.attributeSeparator);
		var mediatorId = parts[0];
		var dataPath = parts[1];
		var mapping = type.getMapping(mediatorId);
		if (mapping) {
			dataSource = resolveDataSource(self, element, type, mediatorId, dataPath);
		}
		return dataSource;
	}

	function resolveDataSource(self, element, mediatorType, mediatorId, dataPath) {
		var dataSource = mediatorType.getMappingData(mediatorId);
		console.log('DATA PATH', dataPath);
		console.log('DATA SOURCE', dataSource);
		console.log('MEDIATOR ID', mediatorId);
		if (dataPath) {
			var resultData = {};
			// http://regex101.com/r/nI3zQ7
			var dataPathList = dataPath.split(/,(?![\w\s'",\\]*\))/g);
			for (var s=0, d=dataPathList.length; s<d; s++) {
				var p = dataPathList[s].split(':');
				var name = p[0];
				var path = p[1];
				var parsedData;
				if (path) {
					// has injection name
					parsedData = parsePath(dataSource, path);
					resultData[name] = parsedData;
					if (parsedData === undefined) {
						resultData[name] = parsePathParent(self, element, path);
					}
				}
				else {
					parsedData = parsePath(dataSource, name);
					resultData['data'] = parsedData;
					if (parsedData === undefined) {
						parsedData = parsePathParent(self, element, name);
						console.log('-_-_-_- pARENT PARSED DATA', element, parsedData);
						resultData = parsedData;
					}
					if (parsedData === undefined || parsedData === null) {
						return parsedData;
					}
				}
			}
			console.log('>>>>>>>>>>>', element, resultData);
			return resultData;
		}
		return dataSource;
	}

	function applyMappingData(injector, data) {
		if (data === undefined || data === null) {
			return;
		}
		if (typeof data === 'object' && Object.prototype.toString.call(data) !== '[object Array]') {
			for (var name in data) {
				if (typeof name === 'string' && data[name] !== undefined && data[name] !== null) {
					injector.mapValue(name, data[name]);
				}
			}
		}
		if (!injector.hasMapping('data')) {
			injector.mapValue('data', data);
		}
	}

	function updateMediatorData(self, type, attrValue, target) {
		if (type && type.has(target)) {
			var dataSource = getDataSource(self, target, type, attrValue);
			var mediator = type.get(target);
			if (dataSource && mediator) {
				var injector = self.injector.createChild();
				injector.mapValue('target', target);
				if (typeof dataSource === 'function') {
					var result = dataSource(injector, i);
					if (result !== undefined && result !== null) {
						applyMappingData(injector, result);
					}
				}
				else if (dataSource !== undefined && dataSource !== null) {
					applyMappingData(injector, dataSource);
				}
				injector.inject(mediator, false);
			}
		}
	}

	function resolveMediatorData(injector, data) {
		if (typeof data === 'function' || data === undefined || data === null) {
			return data;
		}
		var resolvedData;
		if (typeof data !== 'object' || Object.prototype.toString.call(data) === '[object Array]') {
			resolvedData = data;
		}
		else {
			resolvedData = {};
			for (var name in data) {
				if (typeof data[name] === 'string' && injector.hasMapping(data[name])) {
					resolvedData[name] = injector.getValue(data[name]);
				}
				else {
					resolvedData[name] = data[name];
				}
			}
		}
		return resolvedData;
	}

	function inDOM(element) {
		if (!element.parentNode) {
			return typeof HTMLDocument !== 'undefined' && element instanceof HTMLDocument;
		}
		else {
			return inDOM(element.parentNode);
		}
	}

	var contains = typeof document !== 'object' ? function(){} : document.documentElement.contains ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
		} :
		document.documentElement.compareDocumentPosition ?
			function( a, b ) {
				return b && !!( a.compareDocumentPosition( b ) & 16 );
			} :
			function( a, b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
				return false;
			};
	// plugins

	var plugins = [];
	soma.plugins = soma.plugins || {};
	soma.plugins.add = function(plugin) {
		plugins.push(plugin);
	};
	soma.plugins.remove = function(plugin) {
		for (var i = plugins.length-1, l = 0; i >= l; i--) {
			if (plugin === plugins[i]) {
				plugins.splice(i, 1);
			}
		}
	};

	// mutation observers
	// TODO: check with node.js
	if (typeof MutationObserver === 'undefined') {
		if (typeof window !== 'undefined' && typeof window.WebKitMutationObserver !== 'undefined') {
			window.MutationObserver = window.WebKitMutationObserver || window.MozMutationObserver;
		}
	}

	// framework
	soma.Application = soma.extend({
		constructor: function() {

			var self = this;

			function setup() {
				// injector
				self.injector = new infuse.Injector(self.dispatcher);
				// dispatcher
				self.dispatcher = new soma.EventDispatcher();
				// mapping
				self.injector.mapValue('injector', self.injector);
				self.injector.mapValue('instance', self);
				self.injector.mapValue('dispatcher', self.dispatcher);
				// mediator
				self.injector.mapClass('mediators', Mediators, true);
				self.mediators = self.injector.getValue('mediators');
				self.injector.mapValue('mediatorSupport', self.mediators.support.bind(self.mediators));
				// commands
				self.injector.mapClass('commands', Commands, true);
				self.commands = self.injector.getValue('commands');
				// plugins
				for (var i = 0, l = plugins.length; i < l; i++) {
					self.createPlugin(plugins[i]);
				}
			}

			setup();
			this.init();
			this.start();

		},
		createPlugin: function() {
			if (arguments.length === 0 || !arguments[0]) {
				throw new Error('Error creating a plugin, plugin class is missing.');
			}
			var params = infuse.getConstructorParams(arguments[0]);
			var args = [arguments[0]];
			for (var i=0; i<params.length; i++) {
				if (this.injector.hasMapping(params[i]) || this.injector.hasInheritedMapping(params[i])) {
					args.push(this.injector.getValue(params[i]));
				}
			}
			for (var j=1; j<arguments.length; j++) {
				args.push(arguments[j]);
			}
			return this.injector.createInstance.apply(this.injector, args);
		},
		init: function() {

		},
		start: function() {

		},
		dispose: function() {
			// mapping
			if (this.injector) {
				this.injector.removeMapping('injector');
				this.injector.removeMapping('dispatcher');
				this.injector.removeMapping('mediators');
				this.injector.removeMapping('commands');
				this.injector.removeMapping('instance');
			}
			// variables
			if (this.injector) {
				this.injector.dispose();
			}
			if (this.dispatcher) {
				this.dispatcher.dispose();
			}
			if (this.mediators) {
				this.mediators.dispose();
			}
			if (this.commands) {
				this.commands.dispose();
			}
			this.injector = undefined;
			this.dispatcher = undefined;
			this.mediators = undefined;
			this.commands = undefined;
			this.instance = undefined;
		}
	});

	var MediatorType = soma.extend({
		constructor: function(name, injector) {
			this.name = name;
			this.injector = injector;
			this.mappings = {};
			this.list = new soma.utils.HashMap('hm-'+name);
		},
		map: function(id, mediator, data) {
			if (!this.mappings[id] && typeof mediator === 'function') {
				this.mappings[id] = {
					mediator: mediator,
					data: data
				};
			}
			return this;
		},
		unmap: function(id) {
			if (this.mappings[id]) {
				delete this.mappings[id].mediator;
				delete this.mappings[id].data;
				delete this.mappings[id];
			}
			return this;
		},
		hasMapping: function(id) {
			return this.mappings[id] !== undefined && this.mappings[id] !== null;
		},
		getMapping: function(id) {
			return this.mappings[id];
		},
		getMappingData: function(id) {
			if (this.mappings[id]) {
				var data = this.mappings[id].data;
				if (data !== undefined) {
					return resolveMediatorData(this.injector, data);
				}
			}
		},
		has: function(element) {
			return this.list.has(element);
		},
		add: function(element, mediator) {
			console.log('ADD', element);
			if (!this.list.has(element)) {
				this.list.put(element, {
					mediator: mediator,
					element: element
				});
			}
			return this;
		},
		remove: function(element) {
			var item = this.list.get(element);
			if (item) {
				if (item.mediator) {
					if (typeof item.mediator['dispose'] === 'function') {
						item.mediator.dispose();
					}
				}
				delete item.mediator;
				delete item.element;
				this.list.remove(element);
			}
			return this;
		},
		get: function(element) {
			var item = this.list.get(element);
			return item && item.mediator ? item.mediator : undefined;
		},
		removeAll: function() {
			if (this.list) {
				var dataList = this.list.getData();
				for (var el in dataList) {
					this.remove(el);
				}
				this.list.dispose();
			}
			return this;
		},
		dispose: function() {
			this.removeAll();
			this.name = undefined;
			this.injector = undefined;
			this.mappings = undefined;
			if (this.list) {
				this.list.dispose();
			}
			this.list = undefined;
		}
	});

	var Mediators = soma.extend({
		constructor: function() {
			this.types = {};
			this.defaultType = 'data-mediator';
			this.attributeSeparator = '|';
			this.injector = null;
			this.dispatcher = null;
			this.isObserving = false;
			this.observer = null;
		},
		postConstruct: function() {
			this.describe(this.defaultType);
		},
		describe: function(name) {
			if (this.types[name]) {
				throw new Error('The type of mediator has been described already (' + name + ').');
			}
			this.types[name] = new MediatorType(name, this.injector);
			return this.types[name];
		},
		create: function(cl, target, data) {
			if (!cl || typeof cl !== 'function') {
				throw new Error('Error creating a mediator, the first parameter must be a function.');
			}
			if (target === undefined || target === null) {
				throw new Error('Error creating a mediator, the second parameter cannot be undefined or null.');
			}
			var targets = [];
			var list = [];
			if (target.length > 0) {
				targets = target;
			}
			else {
				targets.push(target);
			}
			for (var i= 0, l=targets.length; i<l; i++) {
				var injector = this.injector.createChild();
				injector.mapValue('target', targets[i]);
				var mData = data;
				if (typeof mData === 'function') {
					var result = mData(injector, i);
					if (result !== undefined && result !== null) {
						applyMappingData(injector, result);
					}
				}
				else {
					applyMappingData(injector, resolveMediatorData(this.injector, mData));
				}
				var mediator = injector.createInstance(cl);
				if (targets.length === 1) {
					return mediator;
				}
				list.push(mediator);
			}
			return list;
		},
		getType: function(name) {
			var typeId = name ? name : this.defaultType;
			if (!this.types[typeId]) {
				throw new Error('The type of mediator has been not been found (' + typeId + ').');
			}
			return this.types[typeId];
		},
		removeType: function(name) {
			// todo
		},
		map: function(id, mediator, data, type) {
			return this.getType(type).map(id, mediator, data);
		},
		unmap: function(id, type) {
			return this.getType(type).unmap(id);
		},
		hasMapping: function(id, type) {
			return this.getType(type).hasMapping(id);
		},
		getMapping: function(id, type) {
			return this.getType(type).getMapping(id);
		},
		getMappingData: function(id, type) {
			return this.getType(type).getMappingData(id);
		},
		observe: function(element, parse, config) {
			if (parse === undefined || parse === null || parse) {
				this.parse(element);
			}
			if (typeof MutationObserver !== 'undefined' && element) {
				this.observer = new MutationObserver(function(mutations) {
					for (var i= 0, l=mutations.length; i<l; i++) {
						var mutationType = mutations[i].type;
						switch(mutationType) {
							case 'childList':
//								console.log('>> [mutation][childList]', mutations[i]);
								// added
								var added = mutations[i].addedNodes;
								for (var j= 0, k=added.length; j<k; j++) {
									this.parse(added[j]);
								}
								// removed
								var removed = mutations[i].removedNodes;
								for (var d= 0, f=removed.length; d<f; d++) {
									this.parseToRemove(removed[j]);
								}
								break;
							case 'attributes':
//								console.log('>> [mutation][attribute]', mutations[i]);
								var target = mutations[i].target;
								var attrName = mutations[i].attributeName;
								var attrValue = target.getAttribute(attrName);
								var type = this.types[attrName];
								updateMediatorData(this, type, attrValue, target);
								break;
						}
					}

				}.bind(this));
				// todo remove specific attribute
				this.observer.observe(element, config || {childList: true, subtree: true, attributes: true, attributeOldValue: true});
				this.isObserving = true;
			}
			else {
				if (this.observer) {
					this.observer.disconnect();
				}
				this.observer = null;
				this.isObserving = false;
			}
		},
		parseToRemove: function(element) {
			if (!element || !element.nodeType || element.nodeType === 8 || element.nodeType === 3 || typeof element['getAttribute'] === 'undefined') {
				return;
			}
			for (var typeId in this.types) {
				var attr = element.getAttribute(typeId);
				if (attr) {
					var parts = attr.split(this.attributeSeparator);
					if (parts[0] && this.types[typeId].has(element) && this.types[typeId].hasMapping(parts[0])) {
						this.types[typeId].remove(element);
					}
				}
			}
			var child = element.firstChild;
			while (child) {
				this.parseToRemove(child);
				child = child.nextSibling;
			}
		},
		parse: function(element, updateData) {
			parseDOM(this, element, updateData);
			if (typeof MutationObserver === 'undefined') {
				for (var typeId in this.types) {
					var dataList = this.types[typeId].list.getData();
					for (var el in dataList) {
						var item = dataList[el];
						var el = item.element;
						if (!contains(element, el)) {
							this.remove(el);
						}
					}
				}
			}
		},
		support: function(element) {
			if (typeof MutationObserver === 'undefined') {
				this.parse(element, true);
			}
		},
		add: function(element, mediator, type) {
			this.getType(type).add(element, mediator);
		},
		remove: function(element, type) {
			this.getType(type).remove(element);
		},
		get: function(element, type) {
			return this.getType(type).get(element);
		},
		has: function(element, type) {
			return this.getType(type).has(element);
		},
		removeAll: function(type) {
			this.getType(type).removeAll();
		},
		dispose: function() {
			if (this.observer) {
				this.observer.disconnect();
				this.isObserving = false;
			}
			for (var id in this.types) {
				this.types[id].dispose();
			}
			this.injector = undefined;
			this.dispatcher = undefined;
			this.observer = undefined;
			this.types = undefined;
		}
	});

	var Commands = soma.extend({
		constructor: function() {
			this.boundHandler = this.handler.bind(this);
			this.dispatcher = null;
			this.injector = null;
			this.list = {};
		},
		has: function(commandName) {
			return this.list[commandName] !== null && this.list[commandName] !== undefined;
		},
		get: function(commandName) {
			if (this.has(commandName)) {
				return this.list[commandName];
			}
			return undefined;
		},
		getAll: function() {
			var copy = {};
			for (var cmd in this.list) {
				if (this.list.hasOwnProperty(cmd)) {
					copy[cmd] = this.list[cmd];
				}
			}
			return copy;
		},
		add: function(commandName, command) {
			if (typeof commandName !== 'string') {
				throw new Error('Error adding a command, the first parameter must be a string.');
			}
			if (typeof command !== 'function') {
				throw new Error('Error adding a command with the name "' + command + '", the second parameter must be a function, and must contain an "execute" public method.');
			}
			if (this.has(commandName)) {
				throw new Error('Error adding a command with the name: "' + commandName + '", already registered.');
			}
			this.list[ commandName ] = command;
			this.addInterceptor(commandName);
		},
		remove: function(commandName) {
			if (!this.has(commandName)) {
				return;
			}
			this.list[commandName] = undefined;
			delete this.list[commandName];
			this.removeInterceptor(commandName);
		},
		removeAll: function() {
			for (var cmd in this.list) {
				if (this.list.hasOwnProperty(cmd)) {
					this.remove(cmd);
				}
			}
		},
		addInterceptor: function(commandName) {
			this.dispatcher.addEventListener(commandName, this.boundHandler, -Number.MAX_VALUE);
		},
		removeInterceptor: function(commandName) {
			this.dispatcher.removeEventListener(commandName, this.boundHandler);
		},
		handler: function(event) {
			if (event.isDefaultPrevented && !event.isDefaultPrevented()) {
				this.executeCommand(event);
			}
		},
		executeCommand: function(event) {
			var commandName = event.type;
			if (this.has(commandName)) {
				var command = this.injector.createInstance(this.list[commandName]);
				if (!command.hasOwnProperty('execute') && command['execute'] === 'function') {
					throw new Error('Error in ' + this + ' Command ' + command + ' must contain an execute public method.');
				}
				command.execute(event);
			}
		},
		dispose: function() {
			this.removeAll();
			this.boundHandler = undefined;
			this.dispatcher = undefined;
			this.injector = undefined;
			this.list = undefined;
		}
	});

	// event extend utils

	soma.EventDispatcher.extend = function (obj) {
		return soma.inherit(soma.EventDispatcher, obj);
	};

	soma.Event.extend = function (obj) {
		return soma.inherit(soma.Event, obj);
	};

	infuse.Injector.extend = function(obj) {
		return soma.inherit(infuse.Injector, obj);
	};

	// register for AMD module
	/* globals define:false */
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define('soma', soma);
	}

	// export for node.js
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = soma;
	}
	else {
		window.soma = soma;
	}

})(this['soma'] = this['soma'] || {}, this['infuse']);