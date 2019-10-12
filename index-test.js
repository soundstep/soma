const Application = require('./src/application');

const cu = require('class-utils');

class MyApplication extends Application {
    constructor() {
        super();
        console.log('child constructor');
    }
    init() {
        console.log('-------- INIT');
    }
}

// const MyApplication = Application.extend({
//     contructor() {
//         Application.call(this);
//         console.log('GNAH');
//     },
//     init() {
//         console.log('-------- INIT 2');
//     }
// });

// function MyApplication() {
//     console.log('child constructor');
//     Application.call(this);
// }

// cu.inherit(MyApplication.prototype, Application.prototype);

// const A = cu.inherit(MyApplication.prototype, Application.prototype);
// const A = cu.extend(MyApplication, 1pplication);

// console.log('A', A);


// console.log(MyApplication);
// 


const app = new MyApplication();

app.commands.add('test-command', function() {
    this.execute = (...args) => {
        console.log('exec', args);
    };
})

app.emitter.dispatch('test-command', [1, 2, 3]);

