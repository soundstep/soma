    function interceptorHandler(injector, id, CommandClass, signal, binding) {
        var args = Array.prototype.slice.call(arguments, 5);
        var childInjector = injector.createChild();
        childInjector.mapValue('id', id);
        childInjector.mapValue('signal', signal);
        childInjector.mapValue('binding', binding);
        var command = childInjector.createInstance(CommandClass);
        if (typeof command.execute === 'function') {
            command.execute.apply(command, args);
        }
        childInjector.dispose();
    }

    function addInterceptor(scope, id, CommandClass) {
        var binding = scope.emitter.addListener(id, interceptorHandler, scope);
        binding.params = [scope.injector, id, CommandClass, scope.emitter.getSignal(id), binding];
        return binding;
    }

    function removeInterceptor(scope, id) {
        var signal = scope.emitter.getSignal(id);
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

    var Commands = function(emitter, injector) {
        this.list = {};
        this.emitter = emitter;
        this.injector = injector;
    };

    Commands.prototype.add = function(id, CommandClass) {
        if (this.list[id]) {
            throw new Error('[Commands] Error: a command with the id: "' + id + '" has already been registered');
        }
        this.list[id] = CommandClass;
        var binding = addInterceptor(this, id, CommandClass);
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
        for (var id in this.list) {
            this.remove(id);
        }
        this.list = {};
        this.emitter = undefined;
        this.injector = undefined;
    };

    sweep.Commands = Commands;
