import infuse from '@soundstep/infuse';
import utils from './utils';

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
        const valid = true;
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

export default Modules;
