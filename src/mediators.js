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

export default Mediators;
