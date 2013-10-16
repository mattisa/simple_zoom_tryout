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

  $.fn.zoom = function( options ) {

    var _self = this,

      settings = $.extend({
      // These are the defaults.
      tile_size: 256,
      image_base_path: 'images/map_tiles/',

      zoom_levels: [
        // {zoom_level: '20', columns: 31, rows: 17},
        // {zoom_level: '19', columns: 16, rows: 9},
        {zoom_level: '18', columns: 8, rows: 5},
        {zoom_level: '17', columns: 4, rows: 3}
        ]
      }, options ), 

      $viewport,        // area where map moves
      $touch_area,      // layer top of viewport. this prevents cursor to start drag single images
      current_layer,    // reference to currently active image layer 
      supports_transitions = Modernizr.csstransitions // cached boolean that tells if browser supports transitions
      
    ;
    this._offset = {top: 0, left:0};  // object that contains offset values for map while dragging is happening

    this.build_map = function () {
      var layer, i, j, k, zoom_levels = settings.zoom_levels.length;
      
  
      // loop all zoom levels and make layers based on those
      for(i = 0; i < zoom_levels; i++) {
    
        var columns = settings.zoom_levels[i].columns;
        var rows = settings.zoom_levels[i].rows;
           
        layer = this.build_layer(i, columns, rows);
         
        for(j = 0; j < columns; j ++) {
          for(k = 0; k < rows; k ++) {
            layer.append(this.renderImage(i, j, k));  
          }
        }
        $viewport.append(layer);
      }
      $current_layer = $viewport.find('.image-layer:last').show();
      
    }

    this.build_layer = function (zoom_level, columns, rows) {

      var layer = $('<div>') // build layer
        .addClass('image-layer zool-level-' + settings.zoom_levels[zoom_level].zoom_level)
        .attr('data-width', settings.tile_size * columns)
        .attr('data-height', settings.tile_size * rows);
        
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
    }
    

    this.onImageDragStart = function () {}
   

    this.onImageDrag = function (x, y) {

      _self.moveLayer(x, y);

    }
  
    this.moveLayer = function (x, y) {

     var move_x = (_self._offset.left || 0) - x, 
        move_y = (_self._offset.top || 0) - y;

      _self.changeLayerOffset(move_x, move_y);

      _self._on_drag_stop_offset = {left: move_x, top: move_y};
    }

    this.changeLayerOffset = function (move_x, move_y) {
   
      if(supports_transitions) {
     
        $current_layer.css({transform: 'translate3d('+move_x+'px, '+move_y+'px, 0)'});
     
     } else {
     
        $current_layer.css({
         
          left: move_x, 
          top: move_y 
      
        });
    
      }
    }

    this.handleDoubleClick = function (e) {
      
      var viewport_width = $viewport.width();
      var viewport_height = $viewport.height(); 
      
      console.log(_self._offset.left, _self._offset.top );
      
      var offset_x = _self._offset.left + viewport_width / 2 - e.pageX , 
          offset_y = _self._offset.top + viewport_height / 2 - e.pageY   
      ;
    
      _self.changeLayerOffset(offset_x, offset_y);
    
      _self._offset.left = offset_x;
      _self._offset.top = offset_y;

    
    }

    this.onImageDragStop = function () {
      
      _self._offset = _self._on_drag_stop_offset || _self._offset;
      _self._on_drag_stop_offset = void 0;
    }

    this.bindEvents = function () {

      $touch_area.swipe({
         on_drag_start: _self.onImageDragStart, 
         on_drag: _self.onImageDrag,
         on_drag_stop: _self.onImageDragStop,
         preventDefaultEvents: true
      }); 
      $touch_area.on('dblclick', _self.handleDoubleClick);
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
