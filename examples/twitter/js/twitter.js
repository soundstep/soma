;(function (twitter, undefined) {

	'use strict';

	// application
	var App = soma.Application.extend({
		init:function () {
			this.injector.mapClass('service', TwitterService, true);
			this.commands.add(Events.SEARCH, SearchCommand);

			const template = soma.template.create(document.querySelector('.twitter'));
			var childInjector = this.injector.createChild();
			childInjector.mapValue('template', template);
			childInjector.mapValue('scope', template.scope);
			childInjector.mapValue('element', template.element);
			childInjector.createInstance(TwitterTemplate);
		}
	});

	// event types
	var Events = {
		"SEARCH": "search",
		"SEARCH_RESULT": "search_result"
	};

	// command that triggers the search
	// can be used from anywhere
	var SearchCommand = function (service) {
		return {
			execute:function (query) {
				service.search(query);
			}
		};
	};

	// service that retrieves the list of tweets from the twitter API
	// dispatches a search result event that can be listened to from anywhere
	var TwitterService = function (emitter) {
		// var url = "http://search.twitter.com/search.json";
		var url = "https://api.twitter.com/1.1/search/tweets.json";
		return {
			search:function (query) {
				$.ajax({
					type:'GET',
					url:url + '?q=' + query,
					jsonp: "callback",
					dataType:'jsonp',
					success:function (data) {
						emitter.dispatch(Events.SEARCH_RESULT, [data]);
					}
				});
			}
		};
	};

	// template to display the list of tweets
	var TwitterTemplate = function(template, scope, element, emitter) {
		// registers listeners to handle search and search results events
		emitter.addListener(Events.SEARCH, searchHandler);
		emitter.addListener(Events.SEARCH_RESULT, resultHandler.bind(this));
		// handles a search event, change the message
		function searchHandler() {
			scope.message = "Searching...";
			template.render();
		}
		// handles a search result event, change the message and update the tweet list
		function resultHandler(event) {
			scope.tweets = event.params.results;
			scope.message = "Search result: " + scope.tweets.length;
			template.render();
		}
		// opens a new window to the selected tweet
		scope.visit = function(event, user, id) {
			window.open("http://twitter.com/" + user + "/statuses/" + id);
		};
		// triggers search
		scope.search = function(event) {
			var value = $('.queryInput', element).val();
			if (event.which === 13 && value !== "") {
				emitter.dispatch(Events.SEARCH, [value]);
			}
		};
	};

	// create application
	var app = new App();

	// exports
	twitter.TwitterTemplate = TwitterTemplate;

})(window.twitter = window.twitter || {});
