const assert = require('chai').assert;
const sinon = require('sinon');
const infuse = require('@soundstep/infuse');
const Application = require('../src/application');
const Emitter = require('../src/emitter');
const Commands = require('../src/commands');
const Mediators = require('../src/mediators');
const Modules = require('../src/modules');

describe('Application', function() {

    var app;

    beforeEach(function() {

    });

    afterEach(function() {
        app.dispose();
        app = undefined;
    });

    it('creates an application', function() {
        app = new Application();
        assert.isDefined(app);
        assert.ok(app instanceof Application);
    });

    it('can extend an application', function() {
        var App = Application.extend();
        app = new App();
        assert.isDefined(app);
        assert.ok(app instanceof App);
    });

    it('can take a constructor', function() {
        var called = false;
        var App = Application.extend({
            constructor: function() {
                Application.call(this);
                called = true;
            }
        });
        app = new App();
        assert.ok(called);
    });

    it('calls the init function', function() {
        var called = false;
        var App = Application.extend({
            init: function() {
                Application.prototype.init.call(this);
                called = true;
            }
        });
        app = new App();
        assert.ok(called);
    });

    it('calls the dispose function', function() {
        var called = false;
        var App = Application.extend({
            dispose: function() {
                Application.prototype.dispose.call(this);
                called = true;
            }
        });
        app = new App();
        app.dispose();
        assert.ok(called);
    });

    it('calls the setup function', function() {
        var called = false;
        var App = Application.extend({
            setup: function() {
                Application.prototype.setup.call(this);
                called = true;
            }
        });
        app = new App();
        assert.ok(called);
    });

    it('creates an injector', function() {
        var App = Application.extend();
        app = new App();
        assert.instanceOf(app.injector, infuse.Injector);
        assert.isFalse(app.injector.throwOnMissing);
    });

    it('creates an injector mapping', function() {
        var App = Application.extend();
        app = new App();
        assert.equal(app.injector.getValue('injector'), app.injector);
    });

    it('creates an instance mapping', function() {
        var App = Application.extend();
        app = new App();
        assert.equal(app.injector.getValue('instance'), app);
    });

    it('creates an emitter', function() {
        var App = Application.extend();
        app = new App();
        assert.instanceOf(app.emitter, Emitter);
    });

    it('creates an emitter mapping', function() {
        var App = Application.extend();
        app = new App();
        assert.equal(app.injector.getValue('emitter'), app.emitter);
    });

    it('creates a command manager', function() {
        var App = Application.extend();
        app = new App();
        assert.instanceOf(app.commands, Commands);
    });

    it('creates a command manager mapping', function() {
        var App = Application.extend();
        app = new App();
        assert.equal(app.injector.getValue('commands'), app.commands);
    });

    it('creates a mediator manager', function() {
        var App = Application.extend();
        app = new App();
        assert.instanceOf(app.mediators, Mediators);
    });

    it('creates a mediator manager mapping', function() {
        var App = Application.extend();
        app = new App();
        assert.equal(app.injector.getValue('mediators'), app.mediators);
    });

    it('creates a module manager', function() {
        var App = Application.extend();
        app = new App();
        assert.instanceOf(app.modules, Modules);
    });

    it('creates a module manager mapping', function() {
        var App = Application.extend();
        app = new App();
        assert.equal(app.injector.getValue('modules'), app.modules);
    });

    it('can inject into the module', function() {
        var DummyModuleInjected = function() {
            this.instance = null;
            this.mediators = null;
            this.commands = null;
            this.injector = null;
            this.emitter = null;
            this.modules = null;
        };
        DummyModuleInjected.id = 'moduleName';
        var App = Application.extend();
        app = new App();
        assert.equal(app.injector.getValue('modules'), app.modules);
        var module = app.modules.create(DummyModuleInjected);
        assert.equal(app, module.instance);
        assert.equal(app.injector, module.injector);
        assert.equal(app.mediators, module.mediators);
        assert.equal(app.commands, module.commands);
        assert.equal(app.emitter, module.emitter);
        assert.equal(app.modules, module.modules);
    });

    it('a module can receive parameters and property injection', function() {
        var params = [10, false, 'string', [1, 2, 3], {data:1}];
        var received = [];
        var inst = undefined, em = undefined;
        var Module = function(num, bool, str, arr, obj) {
            received.push(num);
            received.push(bool);
            received.push(str);
            received.push(arr);
            received.push(obj);
            this.instance = null;
            this.emitter = null;
            this.postConstruct = function() {
                inst = this.instance;
                em = this.emitter;
            };
        };
        Module.id = 'moduleName';
        var App = Application.extend();
        app = new App();
        app.modules.create(Module, params);
        assert.equal(inst, app);
        assert.equal(em, app.emitter);
        assert.equal(received[0], params[0]);
        assert.equal(received[1], params[1]);
        assert.equal(received[2], params[2]);
        assert.equal(received[3], params[3]);
        assert.equal(received[4], params[4]);
    });

    it('should dispose the injector', function() {
        app = new Application();
        const spy = sinon.spy(app.injector, 'dispose');
        app.dispose();
        assert.ok(spy.calledOnce);
    });

    it('should dispose the emitter', function() {
        app = new Application();
        const spy = sinon.spy(app.emitter, 'dispose');
        app.dispose();
        assert.ok(spy.calledOnce);
    });

    it('should dispose the commands', function() {
        app = new Application();
        const spy = sinon.spy(app.commands, 'dispose');
        app.dispose();
        assert.ok(spy.calledOnce);
    });

    it('should dispose the mediators', function() {
        app = new Application();
        const spy = sinon.spy(app.mediators, 'dispose');
        app.dispose();
        assert.ok(spy.calledOnce);
    });

    it('should dispose the modules', function() {
        app = new Application();
        const spy = sinon.spy(app.modules, 'dispose');
        app.dispose();
        assert.ok(spy.calledOnce);
    });

});