const assert = require('chai').assert;
const Signal = require('signals');
const Emitter = require('../src/emitter');

describe('Emitter', function() {

    let emitter;

    beforeEach(function() {
        emitter = new Emitter();
    });

    afterEach(function() {
        emitter.dispose();
        emitter = undefined;
    });

    it('creates a standalone emitter', function() {
        assert.isDefined(emitter);
        assert.ok(emitter instanceof Emitter);
    });

    it('adds a listener', function() {
        const handler = function(){};
        const binding = emitter.addListener('event', handler);
        assert.isDefined(binding);
        assert.isObject(binding);
        assert.equal(handler, binding.getListener());
    });

    it('adds a listener once', function() {
        const handler = function(){};
        const binding = emitter.addListenerOnce('event', handler);
        assert.isDefined(binding);
        assert.isObject(binding);
        assert.equal(handler, binding.getListener());
    });

    it('removes a listener', function() {
        const handler = function(){};
        const binding = emitter.addListener('event', handler);
        emitter.removeListener('event', handler);
        assert.isUndefined(binding.getListener());
    });

    it('removes a listener with context', function() {
        let firstCall = true;
        const context = {};
        const handler = function(value) {
            if (firstCall) {
                firstCall = false;
                assert.equal(value, 'first call');
            }
            else {
                assert.fail(undefined, undefined, 'listener has not been removed');
            }
        };
        emitter.addListener('event', handler, context);
        emitter.dispatch('event', ['first call']);
        emitter.removeListener('event', handler, context);
        emitter.dispatch('event', ['second call']);
    });

    it('dispatches to a listener', function() {
        let called = false;
        const handler = function(){
            called = true;
        };
        emitter.addListener('event', handler);
        emitter.dispatch('event');
        assert.ok(called);
    });

    it('dispatches to a listener once', function() {
        let called = 0;
        const handler = function(){
            called++;
        };
        const binding = emitter.addListenerOnce('event', handler);
        emitter.dispatch('event');
        emitter.dispatch('event');
        assert.equal(called, 1);
        assert.isUndefined(binding.getListener());
    });

    it('dispatches to two listeners', function() {
        let count = 0;
        const handler1 = function(){
            count++;
        };
        const handler2 = function(){
            count++;
        };
        emitter.addListener('event', handler1);
        emitter.addListener('event', handler2);
        emitter.dispatch('event');
        assert.equal(count, 2);
    });

    it('dispatches arguments', function() {
        const args = [0, true, 'data', {data:1}];
        let called = false;
        const handler = function(num, bool, str, obj) {
            called = true;
            assert.equal(num, args[0]);
            assert.equal(bool, args[1]);
            assert.equal(str, args[2]);
            assert.deepEqual(obj, args[3]);
        };
        emitter.addListener('event', handler);
        emitter.dispatch('event', args);
        assert.ok(called);
    });

    it('gets a signal', function() {
        const handler = function(){};
        emitter.addListener('event', handler);
        assert.isDefined(emitter.getSignal('event'));
        assert.ok(emitter.getSignal('event') instanceof Signal);
    });

    it('can be extended', function() {
        let called = false;
        const handler = function(){
            called = true;
        };
        const ExtendedEmitter = Emitter.extend({});
        const extended = new ExtendedEmitter();
        extended.addListener('event', handler);
        extended.dispatch('event');
        assert.ok(called);
    });

    it('dispose', function() {
        let called = false;
        const handler = function(){
            called = true;
        };
        const binding = emitter.addListener('event', handler);
        emitter.dispose();
        emitter.dispatch('event');
        binding.execute();
        assert.notOk(called);
        assert.deepEqual(emitter.signals, {});
    });

});