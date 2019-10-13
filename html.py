from pygments import highlight
from pygments.lexers import HtmlLexer
from pygments.formatters import HtmlFormatter

code = """<div class="app">
  <h1>{{content}}</h1>
</div>

<script>

  // function model containing data (text to display)
  var Model = function() {
    this.data = "Hello world!"
  };

  // function template that will update the DOM
  var Template = function(template, scope, element, model) {
    scope.content = model.data;
    template.render();
  };

  // application function
  var QuickStartApplication = soma.Application.extend({
    init: function() {
      // model mapping rule so it can be injected in the template
      this.injector.mapClass("model", Model, true);
      // create a template for a specific DOM element
      this.createTemplate(Template, document.querySelector('.app'));
    }
  });

  // create application
  var app = new QuickStartApplication();

</script>
"""

print highlight(code, HtmlLexer(), HtmlFormatter())