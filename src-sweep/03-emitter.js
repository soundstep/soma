    var Emitter = function() {
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
        var signal = this.signals[id];
        if (signal) {
            signal.remove(handler, scope);
        }
    };

    Emitter.prototype.getSignal = function(id) {
        return this.signals[id];
    };

    Emitter.prototype.dispatch = function(id, args) {
        var signal = this.signals[id];
        if (signal) {
            if (args) {
                signal.dispatch.apply(signal, args);
            } else {
                signal.dispatch();
            }
        }
    };

    Emitter.prototype.dispose = function() {
        for (var id in this.signals) {
            this.signals[id].removeAll();
            this.signals[id] = undefined;
            delete this.signals[id];
        }
        this.signals = {};
    };

    Emitter.extend = function(obj) {
        return utils.inherit(Emitter, obj);
    };

    sweep.Emitter = Emitter;
