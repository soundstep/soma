    var Application = function() {
        this.injector = undefined;
        this.emitter = undefined;
        this.commands = undefined;
        this.mediators = undefined;
        this.setup();
        this.init();
    };

    Application.prototype.setup = function() {
        // create injector
        this.injector = new infuse.Injector();
        this.injector.throwOnMissing = false;
        this.injector.mapValue('injector', this.injector);
        // instance
        this.injector.mapValue('instance', this);
        // emitter
        this.injector.mapClass('emitter', Emitter, true);
        this.emitter = this.injector.getValue('emitter');
        // commands
        this.injector.mapClass('commands', Commands, true);
        this.commands = this.injector.getValue('commands');
        // mediators
        this.injector.mapClass('mediators', Mediators, true);
        this.mediators = this.injector.getValue('mediators');
        // modules
        this.injector.mapClass('modules', Modules, true);
        this.modules = this.injector.getValue('modules');
    };

    Application.prototype.init = function() {

    };

    Application.prototype.dispose = function() {
        if (this.injector) {
            this.injector.dispose();
        }
        if (this.emitter) {
            this.emitter.dispose();
        }
        if (this.commands) {
            this.commands.dispose();
        }
        if (this.mediators) {
            this.mediators.dispose();
        }
        if (this.modules) {
            this.modules.dispose();
        }
        this.injector = undefined;
        this.emitter = undefined;
        this.commands = undefined;
        this.mediators = undefined;
        this.modules = undefined;
    };

    Application.extend = function(obj) {
        return utils.inherit(Application, obj);
    };

    sweep.Application = Application;
