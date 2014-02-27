simple_zoom_tryout
==================

This is just test how some be image could be spitted to pieces and displayed on some kind of viewport

Install requirements
```

> brew install imagemagick
> gem install rmagick
> gem install tileup
```

Split high resolution image to pieces

```
> tileup --in hightres.jpg --auto-zoom 4 --output-dir map_tiles
````
