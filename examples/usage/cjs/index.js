const { Application } = require('../../../dist/cjs/soma');

class Model {
    get() {
        return 'Hello';
    }
}

function Command(model) {
    this.execute = (params) => {
        console.log(`${model.get()} ${params}`);
    }
}

class App extends Application {
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
