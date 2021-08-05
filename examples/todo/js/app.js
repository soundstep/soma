var todo = window.todo || {};

(function( window ) {

	'use strict';

	todo.TodoApp = soma.Application.extend({

		init: function() {

			this.injector.mapClass('model', todo.Model, true);

			this.commands.add( todo.events.ADD, todo.TodoAddCommand );
			this.commands.add( todo.events.REMOVE, todo.TodoRemoveCommand );
			this.commands.add( todo.events.UPDATE, todo.TodoUpdateCommand );
			this.commands.add( todo.events.TOGGLE, todo.TodoToggleCommand );
			this.commands.add( todo.events.TOGGLE_ALL, todo.TodoToggleAllCommand );
			this.commands.add( todo.events.CLEAR_COMPLETED, todo.TodoClearCompletedCommand );

			const template = soma.template.create(document.getElementById('todoapp'));
			var childInjector = this.injector.createChild();
			childInjector.mapValue('template', template);
			childInjector.mapValue('scope', template.scope);
			childInjector.createInstance(todo.Template);

			this.start();
		},

		start: function() {

			var model = this.injector.getValue( 'model' );
			this.emitter.dispatch( todo.events.RENDER, [model.data] );

		}

	});

	var app = new todo.TodoApp();

})( window );
