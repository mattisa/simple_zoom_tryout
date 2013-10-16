

;(function($) {

  var instances = {}, excludeFromPollutionCheck = ['currentbreakpoint', 'onYouTubePlayerAPIReady'];


  $.plugin = function(name, plugin, init_options, undefined) {

    init_options = init_options || {};

    if ($.fn[name] !== undefined && !init_options.force) {
      $.error('jquery.' + name + ': A plugin with same name has been registered already.');
      return false;
    }

    if ((new plugin()).init === undefined) {
      $.error('jquery.' + name + ': Required method #init has not been implemented.');
      return false;
    }

    return $.fn[name] = function(method) {

      var $el, instance, args = Array.prototype.slice.call(arguments, 1), variableCount;

      return this.each(function(i, el) {
        $el = $(el);
        instance = $el.data(name);

        if (!instance && ( typeof method === 'object' || !method)) {
          instances[name] = instances[name] + 1 || 1;
          instance = new plugin();
          $el.data(name, $.extend(true, instance, {
            $el : $el,
            namespace : name + '-' + instances[name],
            options : method
          }));

          checkGlobalScopePolution(name, function() {
            instance.init($el);
          });

        } else if (instance[method] && method !== 'init') {
          instance[method].apply(instance, [$el].concat(args));
        } else {
          $.error('jquery.' + name + ': Method #' + method + ' does not exist. Meaby you are trying to initialize plugin to object that is already initialized.');
        }

        if (method === 'destroy') {
          $el.removeData(name);
        }
      });
    };
  };

  function checkGlobalScopePolution(plugin_name, do_your_thing) {

    if (window.location.hostname !== 'localhost') {
      return do_your_thing();
    }

    var properties_before = {}, after = 0;

    // collect variables from gobal scope
    for (var prop1 in window) {
      properties_before[ prop1.toString()] = true;
    }

    // ok, just do it
    do_your_thing();

    // loop variables again after plugin is initialized
    for (var prop2 in window ) {
      try {
        // check if it exists before plugin init
        if (!properties_before[prop2.toString()]
  
        // drop out properties that should be on global scope.
        && excludeFromPollutionCheck.indexOf(prop2.toString()) < 0
  
        // seems that jquery puts its self to globa scope
        && prop2.toString().substring(0, 6) !== 'jQuery') {
  
          // push angry message for user if something found
          log(plugin_name + " pollutes global scope. New variable added: " + prop2);
        }
      } catch (err) { 
        // IE8 fails
      }
    }

  };

  function log(message) {
    if (console && console.log) {
      console.log(message);
    }
  };

})(jQuery);
