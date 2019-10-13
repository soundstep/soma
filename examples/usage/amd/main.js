require.config({
    paths: {
        "@soundstep/infuse": "../libs/infuse.min",
        "signals": "../libs/signals.min",
        "soma": "../../../dist/soma.min"
    }
});

requirejs(['soma'], function(soma) {

    class Model {
        get() {
            return 'Hello';
        }
    }

    function Command(model) {
        this.execute = (params) => {
            document.body.innerHTML = `${model.get()} ${params}`;
        }
    }

    class App extends soma.Application {
        init() {
            this.injector.mapClass('model', Model, true);
            this.commands.add('test-command', Command);
        }
        start() {
            this.emitter.dispatch('test-command', ['World!']);
        }
    }
    const app = new App();
    app.start();

});


