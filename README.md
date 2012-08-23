[![build status](https://secure.travis-ci.org/reissbaker/css-sourcery.png)](http://travis-ci.org/reissbaker/css-sourcery)
CSS SOURCERY
============

A pure-Javascript CSS templating library, meant for use with node. Features optional semicolons, nested rules, 
functions, optional minification, partials and partial caching.
```require``` in code from the rest of your app where you need it, and feel free to drop down to native CSS as you
see fit.

LET'S MAKE MAGIC
----------------

```javascript
var src = require('css-sourcery');

src.compile([
	src.rule('.sourcery', [
		src.rule('ul', [
			'list-style-type:none',
			function(params) {
				if(params.dumbledore)
					return 'color:yellow';
				return 'color:black';
			}
		]),
		'color: #999',
		'font-family: Helvetica, Arial, sans-serif'
	]),
	"h2 { font-size:40px; color: #666; }"
], { dumbledore: true });
```

ABRACA-WHAT?
---------------

```css
.sourcery ul {
	list-style-type:none;
	color:yellow;
}
.sourcery {
	color:#999;
	font-family: Helvetica, Arial, sans-serif;
}
h2 {
	font-size:40px;
	color:#666;
}
```

Shazam. CSS wizardry.
