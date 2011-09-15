css = require '../index'

template = [
	css.rule '.sourcery', [
		'color:#999'
		'font-family: Helvetica, Arial, sans-serif'
		
		css.ul [
			'list-style-type:none'
			(params) ->
				if params.dumbledore then 'color:yellow' else 'color:black'
		]
		css.nav [
			css.a [
				css.rule ':hover', 'color:red'
				css.rule ':visited', 'color:black'
				'color:black'
			]
		]
	]
	"""
	h2 {
		font-size:40px;
		color:#666;
	}
	"""
]

console.log css.compile(template, { dumbledore: false })
