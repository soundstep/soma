var todo = window.todo || {};

(function( window ) {

	'use strict';

	var ENTER_KEY = 13;

	todo.Template = function( scope, template, emitter ) {

		emitter.addListener( todo.events.RENDER, function( items ) {

			// update template data
			scope.todos = items;
			scope.active = getActiveItems( items );
			scope.completed = scope.todos.length - scope.active;
			scope.allCompleted = scope.todos.length > 0 && scope.active === 0 ? true : false;
			scope.clearCompletedVisible = scope.completed > 0 ? true : false;
			scope.footerVisible = scope.todos.length > 0 ? true : false;
			scope.itemLabel = scope.active === 1 ? 'item' : 'items';

			// render template
			template.render();

		}.bind( this ));

		scope.completedClass = function( completed ) {
			return completed ? 'completed' : '';
		};

		scope.add = function( event ) {
			var value = event.currentTarget.value.trim();
			if ( event.which === ENTER_KEY && value !== '' ) {
				emitter.dispatch( todo.events.ADD, [value] );
				event.currentTarget.value = '';
			}
		};

		scope.edit = function( event, todo ) {
			getLi( event.currentTarget ).classList.add( 'editing' );
		};

		scope.update = function( event, id ) {
			var value = event.currentTarget.value.trim();
			if ( event.which === ENTER_KEY ) {
				if ( value ) {
					emitter.dispatch( todo.events.UPDATE, [{
						id: id,
						title: value
					}]);
				}
				else {
					emitter.dispatch( todo.events.REMOVE, [id] );
				}
				getLi( event.currentTarget ).classList.remove( 'editing' );
			}
		};

		scope.remove = function( event, id ) {
			emitter.dispatch( todo.events.REMOVE, [id] );
		};

		scope.toggle = function( event, id ) {
			emitter.dispatch( todo.events.TOGGLE, [id] );
		};

		scope.toggleAll = function(event) {
			emitter.dispatch( todo.events.TOGGLE_ALL, [event.currentTarget.checked] );
		};

		scope.clearCompleted = function() {
			emitter.dispatch( todo.events.CLEAR_COMPLETED );
		};

		scope.clear = function(event) {
			event.currentTarget.value = '';
		};

		function getActiveItems( data ) {
			return data.filter(function( todo ) {
				return !todo.completed;
			}).length;
		}

		function getLi( element ) {
			return element && element.tagName === 'LI' ? element : getLi( element.parentNode );
		}

	};

})( window );
