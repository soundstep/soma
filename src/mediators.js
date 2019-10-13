const Mediators = function(emitter, injector) {
    this.emitter = emitter;
    this.injector = injector;
};

Mediators.prototype.create = function(target, MediatorClass) {
    if (!MediatorClass || typeof MediatorClass !== 'function') {
        throw new Error('[Mediators] Error creating a mediator, the first parameter must be a function.');
    }
    if (target === undefined || target === null) {
        throw new Error('Error creating a mediator, the second parameter cannot be undefined or null.');
    }
    let targetlist = [];
    const mediatorList = [];
    const targetToString = Object.prototype.toString.call(target);
    if ((targetToString === '[object Array]' || targetToString === '[object NodeList]') && target.length > 0) {
        targetlist = [].concat(target);
    }
    else {
        targetlist.push(target);
    }
    for (const i = 0, l = targetlist.length; i < l; i++) {
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