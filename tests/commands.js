const assert = require('chai').assert;
const infuse = require('@soundstep/infuse');
const Signal = require('signals');
const Emitter = require('../src/emitter');
const Commands = require('../src/commands');

describe('Commands', function() {

    let commands;
    let emitter;
    let injector;

    const DummyCommand = function(){};

    beforeEach(function() {
        emitter = new Emitter();
        injector = new infuse.Injector();
        commands = new Commands(emitter, injector);
    });

    afterEach(function() {
        emitter.dispose();
        commands.dispose();
        injector.dispose();
        commands = undefined;
        emitter = undefined;
        injector = undefined;
    });

    it('adds a command', function() {
        assert.doesNotThrow(() => commands.add('event', DummyCommand));
    });

    it('adds the same command throws an error', function() {
        commands.add('event', DummyCommand);
        assert.throws(function() {
            commands.add('event', DummyCommand);
        }, Error);
    });

    it('adds, removes and add again the same command', function() {
        commands.add('event', DummyCommand);
        commands.remove('event');
        assert.doesNotThrow(function() {
            commands.add('event', DummyCommand);
        }, Error);
    });

    it('adds a command and returns command options', function() {
        const options = commands.add('event', DummyCommand);
        assert.isObject(options);
        assert.isFunction(options.setInjector);
    });

    it('gets a command', function() {
        commands.add('event', DummyCommand);
        assert.equal(commands.get('event'), DummyCommand);
    });

    it('instantiates a command', function() {
        let created = false;
        function Command() {
            created = true;
        }
        commands.add('event', Command);
        emitter.dispatch('event');
        assert.ok(created);
    });

    it('executes a command', function() {
        let executed = false;
        function Command() {
            this.execute = function() {
                executed = true;
            };
        }
        commands.add('event', Command);
        emitter.dispatch('event');
        assert.ok(executed);
    });

    it('executes a command using a specific injector', function() {
        let executed = false;
        injector.mapValue('valueA', 'A');
        const childInjector = injector.createChild();
        childInjector.mapValue('valueB', 'B');
        function Command(valueA, valueB) {
            this.execute = function() {
                assert.equal(valueA, 'A');
                assert.equal(valueB, 'B');
                executed = true;
            };
        }
        commands.add('event', Command).setInjector(childInjector);
        emitter.dispatch('event', [{data:1}]);
        assert.ok(executed);
    });

    it('gets command mapping values', function() {
        let commandId, commandSignal, commandBinding;
        function Command(id, signal, binding) {
            commandId = id;
            commandSignal = signal;
            commandBinding = binding;
        }
        commands.add('event', Command);
        emitter.dispatch('event', [{data:1}]);
        assert.equal(commandId, 'event');
        assert.ok(commandSignal instanceof Signal);
        assert.isDefined(commandBinding);
    });

    it('receives dispatched parameters', function() {
        const args = [1, true, 'string', [1, 2, 3], {data:1}];
        const argsReceived = [];
        function Command() {
            this.execute = function(num, bool, str, arr, obj) {
                argsReceived.push(num);
                argsReceived.push(bool);
                argsReceived.push(str);
                argsReceived.push(arr);
                argsReceived.push(obj);
            };
        }
        commands.add('event', Command);
        emitter.dispatch('event', args);
        assert.deepEqual(args, argsReceived);
    });

    it('dispatches a removed command does not trigger the command', function() {
        let executed = false;
        function Command() {
            this.execute = function() {
                executed = true;
            };
        }
        commands.add('event', Command);
        commands.remove('event');
        emitter.dispatch('event', [{data:1}]);
        assert.notOk(executed);
    });

    it('receives main injector mapped values', function() {
        let valueReceived;
        injector.mapValue('str', 'string');
        function Command(str) {
            valueReceived = str;
        }
        commands.add('event', Command);
        emitter.dispatch('event');
        assert.equal(valueReceived, 'string');
    });

    it('dispose', function() {
        assert.doesNotThrow(() => {
            commands.dispose();
        });
    });

});