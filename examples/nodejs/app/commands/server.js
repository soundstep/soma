const ServerCommand = function(server) {
	this.execute = function() {
		server.start();
	};
};

module.exports = ServerCommand;
