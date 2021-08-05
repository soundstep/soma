var todo = window.todo || {};

(function( window ) {

	'use strict';

	todo.events = {
		'ADD': 'add',
		'RENDER': 'render',
		'REMOVE': 'remove',
		'UPDATE': 'update',
		'TOGGLE': 'toggle',
		'TOGGLE_ALL': 'toggle_all',
		'CLEAR_COMPLETED': 'clear_completed'
	};

	todo.TodoAddCommand = function( model ) {
		this.execute = function( item ) {
			model.addItem( item );
		};
	};

	todo.TodoRemoveCommand = function( model ) {
		this.execute = function( item ) {
			model.removeItem( item );
		};
	};

	todo.TodoUpdateCommand = function( model ) {
		this.execute = function( item ) {
			model.updateItem( item.id, item.title );
		};
	};

	todo.TodoToggleCommand = function( model ) {
		this.execute = function( item ) {
			model.toggleItem( item );
		};
	};

	todo.TodoToggleAllCommand = function( model ) {
		this.execute = function( item ) {
			model.toggleAll( item );
		};
	};

	todo.TodoClearCompletedCommand = function( model ) {
		this.execute = function() {
			model.clearCompleted();
		};
	};

})( window );
