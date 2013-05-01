from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
var Navigation = function(router, dispatcher) {

  // setup routes and dispatch views ids

  router.init('/home');

  router.on('/home', function() {
    dispatchRoute('home');
  });

  router.on('/page1', function() {
    console.log('page 1')
    dispatchRoute('page1');
  });

  router.on('/page2', function() {
    dispatchRoute('page2');
  });

  // in this demo, all routes could have been handled with this single regex route
  // router.on(/.*/, function() {
  //   dispatchRoute(router.getRoute()[0]);
  // });

  function dispatchRoute(id) {
    dispatcher.dispatch('show-view', id);
  }

};

var View = function(target, dispatcher) {
  dispatcher.addEventListener('show-view', function(event) {
    var isCurrentView = target.className.indexOf(event.params) !== -1;
    target.style.display = isCurrentView ? 'block' : 'none';
  });
}

var Application = soma.Application.extend({
  init: function() {
    // create the Director router and make it available through the framework
    this.injector.mapValue('router', new Router());
    // create mediators for the views (DOM Element)
    this.mediators.create(View, document.querySelectorAll('.view'))
  },
  start: function() {
    // instantiate Navigation to start the app
    this.injector.createInstance(Navigation);
  }
});

var app = new Application();
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
