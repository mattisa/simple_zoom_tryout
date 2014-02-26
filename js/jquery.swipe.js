
(function($) {

  $.fn.swipe = function(options) {

    var defaults = {
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


    this.each( function (el) {
      $el = $(this);
      usePointEvents = window.navigator.msPointerEnabled;

      options = $.extend(defaults, options);

      bind();
    });

    function bind() {
      if (pluginBinded) {
        return;
      }

      if(usePointEvents) {
        $el.on("MSPointerDown" + this.namespace, onTouchStart);
      } else {
        $el.on('touchstart' , onTouchStart);
      }
      if(options.useMouseEvents) {
        $el.on('mousedown' , onTouchStart);
        $el.on('mouseup', onTouchEnd);
      }

      pluginBinded = true;
    }

    function cancelTouch() {
    
      $el.off('touchmove');
      $el.off('MSPointerMove');
      $el.off('touchend');
      $el.off('MSPointerUp');
 
      if(options.useMouseEvents) {
        $el.off('mousemove');
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
    
    function trackable(e) {

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
        $el.on('MSPointerMove', onTouchMove);
        $el.on('MSPointerUp', onTouchEnd);
      } else {
        $el.on('touchmove', onTouchMove);
        $el.on('touchend', onTouchEnd);
      }
     
      if(options.useMouseEvents) {
        $el.on('mousemove', onTouchMove);
      }
      
      options.on_drag_start();
    }
  };
})(jQuery);
