// > brew install imagemagick
// > gem install rmagick
// > gem install tileup

// RUN ON COMMAND LINE
// > >tileup --in hightres.jpg --auto-zoom 4 --output-dir map_tiles
// - > Opened hightres.jpg, 7712 x 4352
// - > Tiling image into columns: 31, rows: 17
// - > Tiling image into columns: 16, rows: 9
// - > Tiling image into columns: 8, rows: 5
// - > Tiling image into columns: 4, rows: 3
// - > Finished.

(function ( $ ) {
  
  'use strict';

  $.fn.zoom = function( options ) {

    var _self = this,

      settings = $.extend({
      // These are the defaults.
      tile_size: 256,
      image_base_path: 'images/map_tiles/',

      zoom_levels: [
        {zoom_level: '20', columns: 31, rows: 17},
        {zoom_level: '19', columns: 16, rows: 9},
        {zoom_level: '18', columns: 8, rows: 5},
        {zoom_level: '17', columns: 4, rows: 3}
        ]
      }, options ), 

      $viewport,        // area where map moves
      $touch_area,      // layer top of viewport. this prevents cursor to start drag single images
      $layers = [],
      $current_layer,    // reference to currently active image layer 
      supports_transitions = Modernizr.csstransitions, // cached boolean that tells if browser supports transitions
      $control_zoom_in,
      $control_zoom_out
    ;

    this._offset = {top: 0, left:0};  // object that contains offset values for map while dragging is happening

    this.build_map = function () {
      var layer, i, j, k, zoom_levels = settings.zoom_levels.length;
      
  
      // loop all zoom levels and make layers based on those
      for(i = 0; i < zoom_levels; i++) {
        
        // get zoom levels settings
        var columns = settings.zoom_levels[i].columns;
        var rows = settings.zoom_levels[i].rows;
        
        // build layer
        layer = this.build_layer(i, columns, rows);
         
       // loop columns 
        for(j = 0; j < columns; j ++) {

          // loop rows
          for(k = 0; k < rows; k ++) {
            layer.append(this.renderImage(i, j, k));  
          }
        }

        // put new layer 
        $viewport.append(layer);
      }

      $layers = $viewport.find('.image-layer');
      
      
      $current_layer = $layers.filter(':last').show();
    }

    this.build_layer = function (zoom_level, columns, rows) {

      var layer = $('<div>') // build layer
        .addClass('image-layer zool-level-' + settings.zoom_levels[zoom_level].zoom_level)
        .attr('data-width', settings.tile_size * columns)
        .attr('data-height', settings.tile_size * rows);
        layer.hide();
      
      layer[0]._offset = {top: 0, left: 0};
   
      return layer;          
    }


    this.renderImage = function (zoom, i, j) {
      var left = settings.tile_size * i  + 'px';
      var top = settings.tile_size * j  + 'px';
      return $('<img>').attr('src', this.imgSource(zoom, i, j)).addClass('image-tile').css({left: left, top: top});
    }
    
  
    this.imgSource = function (zoom, j, k) {
      var columns = settings.zoom_levels[zoom].columns;
      var rows = settings.zoom_levels[zoom].rows;
      return settings.image_base_path  + settings.zoom_levels[zoom].zoom_level + '/' + 'map_tile_'+ j + '_' + k +'.jpg';
    }
  

    this.add_controls = function () {
      $touch_area = $('<div>').addClass('touch_area');

      $viewport.append($touch_area);

      $control_zoom_in = $('.button.in');
      $control_zoom_out = $('.button.out');
    }


    this.onImageDragStart = function () {}

   
    this.onImageDrag = function (x, y) {

      _self.moveLayer(x, y);
    }
  

    this.moveLayer = function (x, y) {

     var move_x = ($current_layer[0]._offset.left || 0) - x, 
        move_y = ($current_layer[0]._offset.top || 0) - y;

      _self.changeLayerOffset($current_layer, move_x, move_y);

      $current_layer._on_drag_stop_offset = {left: move_x, top: move_y};
    }


    this.changeLayerOffset = function (layer, move_x, move_y) {
   
      if(supports_transitions) {
        layer.css({transform: 'translate3d('+move_x+'px, '+move_y+'px, 0)'});
     } else {
        layer.css({
          left: move_x, 
          top: move_y 
        });
      }
    }


    this.handleDoubleClick = function (e) {
      
      _self.centerToPosition(e.pageX, e.pageY)
      _self.handleClickZoomIn();

    }

    this.centerToPosition = function (x, y) {

      var viewport_width = $viewport.width(),
          viewport_height = $viewport.height(),
          offset_x = $current_layer[0]._offset.left + viewport_width / 2 - x , 
          offset_y = $current_layer[0]._offset.top + viewport_height / 2 - y   
        ;
    
      _self.changeLayerOffset($current_layer, offset_x, offset_y);
    
      $current_layer[0]._offset.left = offset_x;
      $current_layer[0]._offset.top = offset_y;


    }

    this.onImageDragStop = function () {
      
      $current_layer[0]._offset = $current_layer._on_drag_stop_offset || $current_layer[0]._offset;
        $current_layer[0]._on_drag_stop_offset = void 0;
    }


    this.handleClickZoomIn = function () {
      var next_layer;

      if ($layers.length < $current_layer.index()+1) return;
      
      next_layer =  $layers[$current_layer.index() - 1 ];
      // _self.switchLayerTo(next_layer);
     
      _self.syncLayerPositions($current_layer[0], next_layer);
      $current_layer.hide();
      $current_layer = $(next_layer);
      $current_layer.show();
      _self.changeLayerOffset($current_layer, $current_layer[0]._offset.left, $current_layer[0]._offset.top);
      // console.log($current_layer[0]._offset.left, $current_layer[0]._offset.top);
    
    }

    // seems that i coded this so zoom out layer params flips on zoom out. 
    // think this again ....


    // this.switchLayerTo = function (next_layer) {

    //   _self.syncLayerPositions($current_layer[0], next_layer);
      
    //   $current_layer.hide();
    //   $current_layer = $(next_layer);
    //   $current_layer.show();

    //   _self.changeLayerOffset($current_layer, $current_layer[0]._offset.left, $current_layer[0]._offset.top);
    // }



    this.handleClickZoomOut = function () {
      var next_layer;

      if ($layers.length <= $current_layer.index() +1) return;
      
      next_layer =  $layers[$current_layer.index() +1 ];
      
      // if (true) {

      //   _self.switchLayerTo(next_layer);
     
      // } else {

        _self.syncLayerPositions(next_layer, $current_layer[0]);
        
        $current_layer.hide();
        $current_layer = $(next_layer);
        $current_layer.show();

        _self.changeLayerOffset($current_layer, $current_layer[0]._offset.left, $current_layer[0]._offset.top);
      // }
    
    }

    this.syncLayerPositions = function (prev, next) {
      
      var 
        prev_height = $(prev).data('height'),
        prev_width = $(prev).data('width'),
        next_height = $(next).data('height'),
        next_width = $(next).data('width'), 
        ratio_x = next_width / prev_width, 
        ratio_y = next_height / prev_height,
        viewport_width = $viewport.width(),
        viewport_height = $viewport.height()
      ;
      console.log(prev_height, prev_width, next_height, next_width, ratio_x, ratio_y, viewport_width, viewport_height);
      
      next._offset.left = parseInt( prev._offset.left * ratio_x - viewport_width / ratio_x); 
      next._offset.top = parseInt( prev._offset.top * ratio_y - viewport_height / ratio_y); 
      
    }


    this.bindEvents = function () {

      $touch_area.swipe({
         on_drag_start: _self.onImageDragStart, 
         on_drag: _self.onImageDrag,
         on_drag_stop: _self.onImageDragStop,
         preventDefaultEvents: true
      }); 
      $touch_area.on('dblclick', _self.handleDoubleClick);

      $control_zoom_in.on('click', _self.handleClickZoomIn);
      $control_zoom_out.on('click', _self.handleClickZoomOut);
    }


    this.init = function () {
      $viewport = $(this[0]);
      this.build_map(); 
      this.add_controls();
      this.bindEvents();
    }


    this.init();
    return this;
  };

}( jQuery ));


$(document).ready(function(){
  $('#image').zoom();  
});
