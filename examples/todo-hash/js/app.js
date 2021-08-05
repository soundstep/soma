var todo = window.todo || {};

(function( window ) {

	'use strict';

	todo.TodoApp = soma.Application.extend({

		init: function() {
			this.injector.mapClass( 'model', todo.Model, true );
			this.injector.mapValue( 'router', new Router().init() );

			const template = soma.template.create(document.getElementById('todoapp'));
			var childInjector = this.injector.createChild();
			childInjector.mapValue('template', template);
			childInjector.mapValue('scope', template.scope);
			childInjector.createInstance(todo.Template);
		}

	});

	var app = new todo.TodoApp();

})( window );
