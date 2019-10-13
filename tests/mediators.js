const assert = require('chai').assert;
const infuse = require('@soundstep/infuse');
const Emitter = require('../src/emitter');
const Mediators = require('../src/mediators');

describe('Mediators', function() {

    let mediators;
    let emitter;
    let injector;

    function DummyMediator(target) {
        this.target = target;
    }

    function DummyTarget() {

    }

    beforeEach(function() {
        emitter = new Emitter();
        injector = new infuse.Injector();
        mediators = new Mediators(emitter, injector);
    });

    afterEach(function() {
        mediators.dispose();
        emitter.dispose();
        injector.dispose();
        mediators = undefined;
        emitter = undefined;
        injector = undefined;
    });

    it('has a mediator manager', function() {
        assert.isDefined(mediators);
        assert.ok(mediators instanceof Mediators);
    });

    it('creates a mediator from a target', function() {
        const target = new DummyTarget();
        const mediator = mediators.create(target, DummyMediator);
        assert.ok(mediator instanceof DummyMediator);
        assert.equal(mediator.target, target);
    });

    it('creates mediators from an array of targets', function() {
        const target1 = new DummyTarget();
        const target2 = new DummyTarget();
        const target3 = new DummyTarget();
        const targets = [target1, target2, target3];
        const list = mediators.create(targets, DummyMediator);
        assert.isArray(list);
        assert.ok(list[0] instanceof DummyMediator);
        assert.ok(list[1] instanceof DummyMediator);
        assert.ok(list[2] instanceof DummyMediator);
        assert.equal(list[0].target, target1);
        assert.equal(list[1].target, target2);
        assert.equal(list[2].target, target3);
    });

    it('receives main injector mapped values', function() {
        let valueReceived;
        injector.mapValue('str', 'string');
        const Mediator = function(target, str) {
            valueReceived = str;
        };
        mediators.create(new DummyTarget(), Mediator);
        assert.equal(valueReceived, 'string');
    });

    it('dispose', function() {
        assert.doesNotThrow(() => {
            mediators.dispose();
        });
    });

});
