CSS SOURCERY
============

```javascript
var src = require('css-sourcery');

src.compile(src.rule('.sourcery', [
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
]), { dumbledore: true });
```

Compiles to:
```CSS
.sourcery ul {
	list-style-type:none;
	color:yellow;
}
.sourcery {
	color:#999;
	font-family: Helvetica, Arial, sans-serif;
}
```
