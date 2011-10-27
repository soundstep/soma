var StartCommand = new Class({
	Extends: soma.core.controller.Command,
	execute: function(event) {
		console.log(event, ":: execute");
		switch(event.type) {
			case CommandList.START:
				// anything if you want to start your app from here
		}
	}
});

var LoginCommand = new Class({
	Extends: soma.core.controller.Command,
	Implements: soma.core.IResponder,
	execute: function(event) {
		console.log(event, ":: execute");
		var wire = this.getWire(LoginWire.NAME);
		switch(event.type) {
			case LoginEvent.LOGIN:
				// login attempt
				if (!event.loginVO) return;
				var service = new LoginService();
				service.login(this, event.loginVO);
				this.dispatchEvent(new LoginEvent(LoginEvent.MESSAGE, null, event.info));
				break;
			case LoginEvent.LOGOUT:
				wire.showMessage("");
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.LOGIN));
				break;
			case LoginEvent.MESSAGE:
				wire.showMessage(event.info);
				break;
			case LoginEvent.ERROR:
				wire.showMessage(event.info);
				break;
			case LoginEvent.SUCCESS:
				wire.showMessage("");
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.EMPLOYEE_LIST));
				break;
		}
	},
	fault: function(info){
		console.log(info);
		this.dispatchEvent(new LoginEvent(LoginEvent.ERROR, null, "Login Error, try again."));
	},
	result: function(data) {
		console.log(data);
		this.dispatchEvent(new LoginEvent(LoginEvent.SUCCESS, null, "Success"));
	}
});

var EmployeeCommand = new Class({
	Extends: soma.core.controller.Command,
	execute: function(event) {
		console.log(event, ":: execute");
		var wire = this.getWire(EmployeeWire.NAME);
		var vo = event.employee;
		switch(event.type) {
			case EmployeeEvent.SELECT:
				wire.selectEmployee(vo);
				break;
			case EmployeeEvent.DELETE:
				wire.deleteEmployee(vo);
				break;
			case EmployeeEvent.CREATE:
				wire.createEmployee(vo);
				break;
			case EmployeeEvent.EDIT:
				wire.editEmployee(vo);
				break;
		}
	}
});

var NavigationCommand = new Class({
	Extends: soma.core.controller.Command,
	execute: function(event) {
		console.log(event, ":: execute");
		this.getWire(NavigationWire.NAME).select(event.navigationID);
	}
});

