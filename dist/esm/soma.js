import infuse from '@soundstep/infuse';
import Signal from 'signals';

const utils = {};

utils.is = {
    object: (value) => typeof value === 'object' && value !== null,
    array: Array.isArray || ((value) => Object.prototype.toString.call(value) === '[object Array]'),
    func: (value) => typeof value === 'function'
};

utils.applyProperties = (target, extension, bindToExtension, list) => {
    if (Object.prototype.toString.apply(list) === '[object Array]') {
        for (const i = 0, l = list.length; i < l; i++) {
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
        for (const prop in extension) {
            if (bindToExtension && typeof extension[prop] === 'function') {
                target[prop] = extension[prop].bind(extension);
            }
            else {
                target[prop] = extension[prop];
            }
        }
    }
};

utils.augment = (target, extension, list) => {
    if (!extension.prototype || !target.prototype) {
        return;
    }
    if (Object.prototype.toString.apply(list) === '[object Array]') {
        for (const i = 0, l = list.length; i < l; i++) {
            if (!target.prototype[list[i]]) {
                target.prototype[list[i]] = extension.prototype[list[i]];
            }
        }
    }
    else {
        for (const prop in extension.prototype) {
            if (!target.prototype[prop]) {
                target.prototype[prop] = extension.prototype[prop];
            }
        }
    }
};

utils.inherit = (parent, obj) => {
    let Parent;
    if (obj && obj.hasOwnProperty('constructor')) {
        // use constructor if defined
        Parent = obj.constructor;
    } else {
        // call the super constructor
        Parent = function () {
            return parent.apply(this, arguments);
        };
    }
    // set the prototype chain to inherit from the parent without calling parent's constructor
    const Chain = function(){};
    Chain.prototype = parent.prototype;
    Parent.prototype = new Chain();
    // add obj properties
    if (obj) {
        utils.applyProperties(Parent.prototype, obj);
    }
    // point constructor to the Parent
    Parent.prototype.constructor = Parent;
    // set super class reference
    Parent.parent = parent.prototype;
    // add extend shortcut
    Parent.extend = function (obj) {
        return utils.inherit(Parent, obj);
    };
    return Parent;
};

utils.extend = obj => utils.inherit(function() {}, obj);

const Emitter = function() {
    this.signals = {};
};

Emitter.prototype.addListener = function(id, handler, scope, priority) {
    if (!this.signals[id]) {
        this.signals[id] = new Signal();
    }
    return this.signals[id].add(handler, scope, priority);
};

Emitter.prototype.addListenerOnce = function(id, handler, scope, priority) {
    if (!this.signals[id]) {
        this.signals[id] = new Signal();
    }
    return this.signals[id].addOnce(handler, scope, priority);
};

Emitter.prototype.removeListener = function(id, handler, scope) {
    const signal = this.signals[id];
    if (signal) {
        signal.remove(handler, scope);
    }
};

Emitter.prototype.getSignal = function(id) {
    return this.signals[id];
};

Emitter.prototype.dispatch = function(id, args) {
    const signal = this.signals[id];
    if (signal) {
        if (args) {
            signal.dispatch.apply(signal, args);
        } else {
            signal.dispatch();
        }
    }
};

Emitter.prototype.dispose = function() {
    for (const id in this.signals) {
        this.signals[id].removeAll();
        this.signals[id] = undefined;
        delete this.signals[id];
    }
    this.signals = {};
};

Emitter.extend = function(obj) {
    return utils.inherit(Emitter, obj);
};

function interceptorHandler(injector, id, CommandClass, signal, binding) {
    const args = Array.prototype.slice.call(arguments, 5);
    const childInjector = injector.createChild();
    childInjector.mapValue('id', id);
    childInjector.mapValue('signal', signal);
    childInjector.mapValue('binding', binding);
    const command = childInjector.createInstance(CommandClass);
    if (typeof command.execute === 'function') {
        command.execute.apply(command, args);
    }
    childInjector.dispose();
}

function addInterceptor(scope, id, CommandClass) {
    const binding = scope.emitter.addListener(id, interceptorHandler, scope);
    binding.params = [scope.injector, id, CommandClass, scope.emitter.getSignal(id), binding];
    return binding;
}

function removeInterceptor(scope, id) {
    const signal = scope.emitter.getSignal(id);
    if (signal) {
        signal.removeAll();
    }
}

function commandOptions(binding) {
    return {
        setInjector: function(injector) {
            if (binding && injector) {
                binding.params[0] = injector;
            }
            return commandOptions(binding);
        }
    };
}

const Commands = function(emitter, injector) {
    this.list = {};
    this.emitter = emitter;
    this.injector = injector;
};

Commands.prototype.add = function(id, CommandClass) {
    if (this.list[id]) {
        throw new Error('[Commands] Error: a command with the id: "' + id + '" has already been registered');
    }
    this.list[id] = CommandClass;
    const binding = addInterceptor(this, id, CommandClass);
    return commandOptions(binding);
};

Commands.prototype.get = function(id) {
    return this.list[id];
};

Commands.prototype.remove = function(id) {
    if (this.list[id]) {
        this.list[id] = undefined;
        delete this.list[id];
        removeInterceptor(this, id);
    }
};

Commands.prototype.dispose = function() {
    for (const id in this.list) {
        this.remove(id);
    }
    this.list = {};
    this.emitter = undefined;
    this.injector = undefined;
};

Commands.extend = function(obj) {
    return utils.inherit(Commands, obj);
};

const Mediators = function(emitter, injector) {
    this.emitter = emitter;
    this.injector = injector;
};

Mediators.prototype.create = function(target, MediatorClass) {
    if (target === undefined || target === null) {
        throw new Error('Error creating a mediator, the first parameter cannot be undefined or null.');
    }
    if (!MediatorClass || typeof MediatorClass !== 'function') {
        throw new Error('[Mediators] Error creating a mediator, the second parameter must be a function.');
    }
    let targetlist = [];
    const mediatorList = [];
    if (Array.isArray(target) && target.length > 0) {
        targetlist = [].concat(target);
    }
    else {
        targetlist.push(target);
    }
    for (let i = 0, l = targetlist.length; i < l; i++) {
        const injector = this.injector.createChild();
        injector.mapValue('target', targetlist[i]);
        const mediator = injector.createInstance(MediatorClass);
        if (targetlist.length === 1) {
            return mediator;
        }
        mediatorList.push(mediator);
    }
    return mediatorList;
};

Mediators.prototype.dispose = function() {
    this.emitter = undefined;
    this.injector = undefined;
};

const Modules = function(injector) {
    this.injector = injector;
    this.list = {};
};

Modules.prototype.create = function(module, args, register, useChildInjector) {

    let moduleInstance;
    let moduleClass;
    const shouldRegister = register === false ? false : true;
    const shouldUseChildInjector = useChildInjector === true ? true : false;

    // register module
    function add(list, id, instance) {
        if (!list[id] && shouldRegister) {
            list[id] = instance;
        }
    }

    // validate module
    function validate(moduleClass) {
        let valid = true;
        if (moduleClass === undefined || moduleClass === null) {
            valid = false;
        }
        else if (typeof moduleClass.id !== 'string') {
            valid = false;
        }
        return valid;
    }

    // create module instance
    function instantiate(injector, value, args) {

        const params = infuse.getDependencies(value);

        // add module function
        let moduleArgs = [value];

        // add injection mappings
        for (let i=0, l=params.length; i < l; i++) {
            if (injector.hasMapping(params[i]) || injector.hasInheritedMapping(params[i])) {
                moduleArgs.push(injector.getValue(params[i]));
            }
            else {
                moduleArgs.push(undefined);
            }
        }

        // trim array
        for (let a = moduleArgs.length-1; a >= 0; a--) {
            if (typeof moduleArgs[a] === 'undefined') {
                moduleArgs.splice(a, 1);
            }
            else {
                break;
            }
        }

        // add arguments
        moduleArgs = moduleArgs.concat(args);

        return injector.createInstance.apply(injector, moduleArgs);

    }

    // find module class
    if (utils.is.func(module)) {
        // module function is sent directly
        moduleClass = module;
    }
    else if (utils.is.object(module) && utils.is.func(module.module)) {
        // module function is contained in an object, on a "module"
        moduleClass = module.module;
    }
    else if (utils.is.object(module) && utils.is.func(module.Module)) {
        // module function is coming from an ES6 import as a Module property
        moduleClass = module.Module;
    }
    else {
        throw new Error('[Modules] Error: Could not create module. The module must be a function or an object containing a module property referencing a function.');
    }

    // validate module
    if (!validate(moduleClass)) {
        throw new Error('[Modules] Error: Could not create module. The module function must contain a static "id" property, ex: function Module(){}; Module.id = "module-name"; ');
    }

    // instantiate
    if (moduleClass) {
        if (this.has(moduleClass.id)) {
            // module already exists
            moduleInstance = this.get(moduleClass.id);
        }
        else {
            let injectorTarget = this.injector;
            if (shouldUseChildInjector) {
                injectorTarget = this.injector.createChild();
                injectorTarget.mapValue('injector', injectorTarget);
            }
            moduleInstance = instantiate(injectorTarget, moduleClass, args);
            add(this.list, moduleClass.id, moduleInstance);
            if (typeof moduleInstance.init === 'function') {
                moduleInstance.init();
            }
        }

    }

    return moduleInstance;

};

Modules.prototype.has = function(id) {
    return this.list[id] !== undefined;
};

Modules.prototype.get = function(id) {
    return this.list[id];
};

Modules.prototype.remove = function(id) {
    if (this.list[id]) {
        if (typeof this.list[id].dispose === 'function') {
            this.list[id].dispose();
        }
        this.list[id] = undefined;
        delete this.list[id];
    }
};

Modules.prototype.dispose = function() {
    for (const id in this.list) {
        this.remove(id);
    }
    this.list = {};
};

var Application = function() {
    this.injector = undefined;
    this.emitter = undefined;
    this.commands = undefined;
    this.mediators = undefined;
    this.setup();
    this.init();
};

Application.prototype.setup = function() {
    // create injector
    this.injector = new infuse.Injector();
    this.injector.throwOnMissing = false;
    this.injector.mapValue('injector', this.injector);
    // instance
    this.injector.mapValue('instance', this);
    // emitter
    this.injector.mapClass('emitter', Emitter, true);
    this.emitter = this.injector.getValue('emitter');
    // commands
    this.injector.mapClass('commands', Commands, true);
    this.commands = this.injector.getValue('commands');
    // mediators
    this.injector.mapClass('mediators', Mediators, true);
    this.mediators = this.injector.getValue('mediators');
    // modules
    this.injector.mapClass('modules', Modules, true);
    this.modules = this.injector.getValue('modules');
};

Application.prototype.init = function() {

};

Application.prototype.dispose = function() {
    if (this.injector) {
        this.injector.dispose();
    }
    if (this.emitter) {
        this.emitter.dispose();
    }
    if (this.commands) {
        this.commands.dispose();
    }
    if (this.mediators) {
        this.mediators.dispose();
    }
    if (this.modules) {
        this.modules.dispose();
    }
    this.injector = undefined;
    this.emitter = undefined;
    this.commands = undefined;
    this.mediators = undefined;
    this.modules = undefined;
};

Application.extend = function(obj) {
    return utils.inherit(Application, obj);
};

export { Application, Application as Commands, Application as Emitter, Application as Mediators, Application as Modules, utils };
