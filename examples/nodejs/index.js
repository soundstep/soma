const soma = require('@soundstep/soma');
const Server = require('./app/models/server');
const PageTemplate = require('./app/views/template');
const ContentModel = require('./app/models/content');
const ServerCommand = require('./app/commands/server');

class MyApplication extends soma.Application {
	init() {
		// mapping rules
		this.injector.mapValue('rootDir', __dirname);
		this.injector.mapValue('PageTemplate', PageTemplate);
		this.injector.mapClass('server', Server, true);
		this.injector.mapClass('model', ContentModel, true);
		// commands
		this.commands.add('start-server', ServerCommand);
		this.start();
	}
	start() {
		// start server
		this.emitter.dispatch("start-server");
	}
}

const app = new MyApplication();
