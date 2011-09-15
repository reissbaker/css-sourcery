###
	Utility functions.
	==================
###

# returns true if the object is an array
isArray = (value) ->
	s = typeof value
	if s == 'object' && value && value instanceof Array
		return true
	return false

# returns the 'correct' type of an object -- exactly the
# same as typeof operator, except it returns 'array' for
# native arrays.
typeOf = (value) ->
	if isArray(value)
		return 'array'
	return typeof value

# trims leading, trailing whitespace
trim = (string) ->
	string.replace /^\s+|\s+$/g, ''

# converts all whitespace to single spaces
singleSpace = (string) ->
	string.replace /\s+/g, ' '

# minifies CSS to get rid of comments, unnecessary whitespace
minify = (string) ->
	singleSpace(trim(string.replace(/\/\*(?:.|\s)*?\*\//g, ''))) # remove comments, trim whitespace, singlespace
		.replace(/\s+:/g, ':') # replace whitespace before colons
		.replace(/:\s+/g, ':') # replace whitespace after colons
		.replace(/\{\s+/g, '{') # replace whitespace after {
		.replace(/\s+\}/g, '}') # replace whitespace before }
		.replace(/\s+\./g, '.') # replace whitespace before .
		.replace(/\s+#/g, '#') # replace whitespace before #
		.replace(/\s+\{/g, '{') # replace whitespace before {
		.replace(/\}\s+/g, '}') # replace whitespace after }
		.replace(/;\s+/g, ';') # replace whitespace after ;
		.replace(/\s+;/g, ';') # replace whitespace before ;
		.replace(/,\s+/g, ',') # replace whitespace after ,
		.replace(/\s+,/g, ',') # replace whitespace before ,
		
# concatenates an array of strings into a single string
concatenateAll = (array) ->
	cat = ''
	cat += s for s in array
	cat

###
	Patterns.
	=========
###

# pattern that matches individual styles
style = /[a-zA-Z\-]+\s*:\s*[^:;]+;/g
# pattern that matches rules
rule = /[^:\{\}]+\s*\{\s*[^\}]+\s*\}/g

# function for getting trimmed regexes
getMatches = (string, regex) ->
	matches = string.match regex
	trimmed = []
	if matches
		trimmed.push trim(match) for match in matches
	trimmed

# function for getting styles
getStyles = (string) ->
	getMatches string, style
# function for getting rules
getRules = (string) ->
	getMatches string, rule
# function to ensure all styles end with ;
ensureSemicolon = (styleString) ->
	styleString
		.replace(/\s*$/, ';')
		.replace(/;;/, ';')

###
	Compilation.
	============
###

# precompiles any functions in the content into whatever their
# return values are. non-destructive. returns the precompiled
# output.
precompile = (content, params) ->
	if typeOf(content) == 'array'
		precompiled = []
		precompiled.push(precompile(c, params)) for c in content
		return precompiled
	if typeOf(content) == 'string'
		return content
	if typeOf(content) == 'function'
		return precompile content(params)
	return new Rule(content.selector, precompile(content.styles, params))

# returns true if the content given is something that would
# need to be lifted, assuming the content is nested inside of
# something.
needsLift = (content) ->
	if typeOf(content) == 'string'
		if getRules(content).length != 0
			return true
		return false
	return true

# lifts all rules to their top levels. adds selectors to them as
# necessary. returns the lifted rules. NOTE: the content MUST be
# precompiled, or this will fail!
lift = (content) ->
	lifted = []
	if typeOf(content) == 'array'
		lifted = lifted.concat lift(c) for c in content
		return lifted
	if typeOf(content) == 'string'
		lifted.push content
		return lifted
	# only other option is a Rule
	filtered = new Rule content.selector, []
	for child in content.styles
		liftedChildren = lift(child)
		for liftedChild in liftedChildren
			if needsLift(liftedChild)
				if typeOf(liftedChild) == 'string'
					rules = getRules liftedChild
					lifted.push(content.selector + ' ' + r) for r in rules
				else
					combinedSelector = content.selector + (unless liftedChild.selector.charAt(0) == ':' then ' ' else '') + liftedChild.selector
					lifted.push(new Rule(combinedSelector, liftedChild.styles))
			else
				filtered.styles.push ensureSemicolon(liftedChild)
	lifted.push filtered if filtered.styles.length > 0
	return lifted
		

# compiles content, given params. NOTE: the content MUST be
# precompiled AND lifted, or this will fail!
compile = (content, depth) ->
	if typeOf(content) == 'array'
		compiled = ''
		compiled += compile(s, depth) for s in content
		return compiled
	# if it's a string, return it 
	if typeOf(content) == 'string'
		return if depth > 0 then "\n\t#{content}" else "\n#{content}"
	# only other allowable option is a Rule
	return "\n#{content.selector} {" + compile(content.styles, depth+1) + "\n}"


###
	Classes.
	========
###

class Rule
	constructor: (@selector, styles) ->
		unless isArray styles
			@styles = [styles]
		else
			@styles = styles
	compile: (params) ->
		unless params
			params = {}
		compile(lift(precompile(this, params)), 0)

###
 Exports.
 ========
###

exports.compile = (content, params) ->
	if params
		compile(lift(precompile(content, params)), 0)
	else
		compile(lift(precompile(content, {})), 0)
exports.minify = (string) ->
	minify string
exports.concatenate = (array) ->
	concatenateAll array
exports.rule = (selector, styles) ->
	new Rule selector, styles

buildRule = (selector) ->
	(styles) ->
		exports.rule selector, styles

# throw in some sugar for creating most HTML5 tags
tags = [
	'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bb', 'bdo', 'blockquote', 'body',
	'button', 'canvas', 'caption', 'cite', 'code', 'colgroup', 'datagrid', 'datalist', 'dd', 'del',
	'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'fieldset', 'figure', 'footer', 'form',
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'html', 'i', 'iframe', 'ins', 'kbd',
	'label', 'legend', 'li', 'map', 'mark', 'menu', 'meter', 'nav', 'noscript', 'object', 'ol',
	'optgroup', 'option', 'output', 'p', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 'samp', 
	'script', 'section', 'select', 'small', 'span', 'strong', 'style', 'sub', 'sup', 'table',
	'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'ul', 'var', 'video'
	'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param',
	'source'
]

for tag in tags
	exports[tag] = buildRule(tag)
