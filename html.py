from pygments import highlight
from pygments.lexers import HtmlLexer
from pygments.formatters import HtmlFormatter

code = """<script>
// simple function that will be injected into the model
// a boolean dependency is injected
var Config = function(debugMode) {
  console.log("debugMode injected in Config:", debugMode);
};
// simple function in which a config instance and a boolean is injected
var Model = function(debugMode, config) {
  console.log("debugMode injected in Model:", debugMode);
  console.log("config injected in Model:", config);
};

// function model containing data (text to display)
var MyApplication = soma.Application.extend({
  init: function() {
    // mapping rule: map the string "config" to the function Config
    this.injector.mapClass("config", Config);
    // mapping rule: map the string "debugMode" to a boolean
    this.injector.mapValue("debugMode", true);
    // instantiate the model using the injector
    this.start();
  },
  start: function() {
    var model = this.injector.createInstance(Model);
  }
});

var app = new MyApplication();
</script>
"""

print highlight(code, HtmlLexer(), HtmlFormatter())