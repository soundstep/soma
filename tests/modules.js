const assert = require('chai').assert;
const infuse = require('@soundstep/infuse');
const Modules = require('../src/modules');

describe('Modules', function() {

    'use strict';

    let modules;
    let injector;

    var DummyModule = function() {
        this.disposed = false;
        this.initialized = false;
        this.init = function() {
            this.initialized = true;
        };
        this.dispose = function() {
            this.disposed = true;
        };
    };

    DummyModule.id = 'moduleName';

    beforeEach(function() {
        injector = new infuse.Injector();
        modules = new Modules(injector);
    });

    afterEach(function() {
        modules.dispose();
        injector.dispose();
        modules = undefined;
        injector = undefined;
    });

    it('has a module manager', function() {
        assert.isDefined(modules);
        assert.ok(modules instanceof Modules);
    });

    it('can create a module from a function', function() {
        var module = modules.create(DummyModule);
        assert.isDefined(module);
        assert.ok(module instanceof DummyModule);
    });

    it('can create a module from an object', function() {
        var obj = {
            module: DummyModule
        };
        var module = modules.create(obj);
        assert.isDefined(module);
        assert.ok(module instanceof DummyModule);
    });

    it('can create a module from an es6 import', function() {
        var obj = {
            Module: DummyModule
        };
        var module = modules.create(obj);
        assert.isDefined(module);
        assert.ok(module instanceof DummyModule);
    });

    it('init function called on a module', function() {
        var module = modules.create(DummyModule);
        assert.ok(module.initialized);
    });

    it('module id missing throws an error', function() {
        assert.throw(function() {
            modules.create(function(){});
        }, Error);
    });

    it('invalid module throws an error', function() {
        var invalidModuleParam = {wrong:11};
        assert.throws(function() {
            modules.create(invalidModuleParam);
        }, Error);
    });

    it('can send parameters to the module', function() {
        var params = [10, false, 'string', [1, 2, 3], {data:1}];
        var received = [];
        var Module = function(num, bool, str, arr, obj) {
            received.push(num);
            received.push(bool);
            received.push(str);
            received.push(arr);
            received.push(obj);
        };
        Module.id = 'moduleName';
        modules.create(Module, params);
        assert.equal(received[0], params[0]);
        assert.equal(received[1], params[1]);
        assert.equal(received[2], params[2]);
        assert.equal(received[3], params[3]);
        assert.equal(received[4], params[4]);
    });

    it('missing injection mappings are handled', function() {
        var params = [10, false, 'string', [1, 2, 3], {data:1}];
        var received = [];
        injector.throwOnMissing = false;
        injector.mapValue('injector', injector);
        injector.mapValue('injection1', 'inj1');
        injector.mapValue('injection2', 'inj2');
        var Module = function(injector, missingParameter, injection1, injection2, num, bool, str, arr, obj) {
            received.push(injector);
            received.push(missingParameter);
            received.push(injection1);
            received.push(injection2);
            received.push(num);
            received.push(bool);
            received.push(str);
            received.push(arr);
            received.push(obj);
        };
        Module.id = 'moduleName';
        modules.create(Module, params);
        assert.equal(received[0], injector);
        assert.equal(received[1], undefined);
        assert.equal(received[2], 'inj1');
        assert.equal(received[3], 'inj2');
        assert.equal(received[4], params[0]);
        assert.equal(received[5], params[1]);
        assert.equal(received[6], params[2]);
        assert.equal(received[7], params[3]);
        assert.equal(received[8], params[4]);
    });

    it('module is registered', function() {
        var module = modules.create(DummyModule);
        assert.equal(module, modules.list[DummyModule.id]);
    });

    it('manager has module', function() {
        var module = modules.create(DummyModule);
        assert.ok(module, modules.has(DummyModule.id));
    });

    it('can get registered module', function() {
        var module = modules.create(DummyModule);
        assert.equal(module, modules.get(DummyModule.id));
    });

    it('can remove module', function() {
        modules.create(DummyModule);
        modules.remove(DummyModule.id);
        assert.isUndefined(modules.get(DummyModule.id));
    });

    it('removed module has been disposed', function() {
        var module = modules.create(DummyModule);
        modules.remove(DummyModule.id);
        assert.ok(module.disposed);
    });

    it('module id null is invalid', function() {
        var Invalid = function(){};
        Invalid.id = null;
        assert.throws(function() {
            modules.create(Invalid);
        }, Error);
    });

    it('module id not string is invalid', function() {
        var Invalid = function(){};
        Invalid.id = 10;
        assert.throws(function() {
            modules.create(Invalid);
        }, Error);
    });

    it('missing module throws an error', function() {
        assert.throws(function() {
            modules.create();
        }, Error);
    });

    it('creating twice the same module does not replace the previous', function() {
        var module1 = modules.create(DummyModule);
        var module2 = modules.create(DummyModule);
        assert.equal(module1, module2);

    });

    it('can create a non-registered module', function() {
        var module = modules.create(DummyModule, undefined, false);
        assert.isDefined(module);
        assert.isUndefined(modules.get(DummyModule.id));

    });

    it('non-registered modules are new instance', function() {
        var module1 = modules.create(DummyModule, undefined, false);
        var module2 = modules.create(DummyModule, undefined, false);
        assert.notEqual(module1, module2);
    });

    it('should create a module with a child injector', function() {
        var ModuleExample = function(injector) {
            this.inj = injector;
        }
        ModuleExample.id = 'module-example';
        var module = modules.create(ModuleExample, undefined, false, true);
        assert.isDefined(module);
        assert.instanceOf(module.inj, infuse.Injector);
        assert.notEqual(module.inj, injector);
        assert.equal(module.inj.parent, injector);
    });

});
