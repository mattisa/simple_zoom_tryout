
(function($) {

  $.plugin('swipe', function() {

    var options = {
      on_drag_start: function() {},
      on_drag:        function() {},
      on_drag_stop:  function() {},
      useMouseEvents: true, 
      preventDefaultEvents: true, 
      debug: false
    };
    
    var $el,
        startX, 
        startY, 
        pos_diff_X = 0, 
        pos_diff_Y = 0, 
        trackable, 
        isMoving = false, 
        speedSamplerTimer,
        current_speed_X = 0,
        current_speed_Y = 0, 
        pluginBinded = false, 
        usePointEvents = false;


    this.init = function(el) {
      $el = $(el);
      usePointEvents = window.navigator.msPointerEnabled;

      options = $.extend(options, this.options);

      this.bind();
    }

    this.bind = function() {
      if (pluginBinded) {
        return;
      }

      if(usePointEvents) {
        $el.on("MSPointerDown." + this.namespace, onTouchStart);
      } else {
        $el.on('touchstart.' + this.namespace , onTouchStart);
      }
      if(options.useMouseEvents) {
        $el.on('mousedown.' + this.namespace , onTouchStart);
        $el.on('mouseup.' + this.namespace, onTouchEnd);
      }

      pluginBinded = true;
    }

    this.unbind = function() {

      $el.off('touchstart.' + this.namespace);
      $el.off('MSPointerDown.' + this.namespace);
      pluginBinded = false;
    }

    function cancelTouch() {
    
      $el.off('touchmove.' + this.namespace);
      $el.off('MSPointerMove.' + this.namespace);
      $el.off('touchend.' + this.namespace);
      $el.off('MSPointerUp.' + this.namespace);
 
      if(options.useMouseEvents) {
        $el.off('mousemove.' + this.namespace);
      }
      
      startX = null;
      isMoving = false;
      clearInterval(speedSamplerTimer);
    }

    function onTouchEnd(e) {
      cancelTouch();
      options.on_drag_stop(pos_diff_X, pos_diff_Y);
    }


    function onTouchMove(e) {
      e.preventDefault();
      if (isMoving) {
        var x = trackable(e).pageX;
        var y = trackable(e).pageY;
        pos_diff_X = startX - x;
        pos_diff_Y = startY - y;
        options.on_drag(pos_diff_X, pos_diff_Y)
      }
    }
    
    var trackable = function(e) {
      
      if(e.originalEvent) {
        e = e.originalEvent;
      }

      if (e.targetTouches && e.targetTouches.length === 1) {
        return e.touches[0];
      } else {
        return e;
      }
    }
    
    function onTouchStart(e) {
      // e.preventDefault();
      startX = trackable(e).pageX;
      startY = trackable(e).pageY;
      isMoving = true;

      if(usePointEvents) {
        $el.on('MSPointerMove.' + this.namespace, onTouchMove);
        $el.on('MSPointerUp.' + this.namespace, onTouchEnd);
      } else {
        $el.on('touchmove.' + this.namespace, onTouchMove);
        $el.on('touchend.' + this.namespace, onTouchEnd);
      }
     
      if(options.useMouseEvents) {
        $el.on('mousemove.' + this.namespace, onTouchMove);
      }
      
      options.on_drag_start();
    }
  });

})(jQuery);
