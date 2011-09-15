vows = require 'vows'
src = require '../index'
assert = require 'assert'

testRule = 'div{font-size:2px;color:#fff;}'
nestedTestRule = src.minify """
div h2 {
	position:relative;
	top:10px;
}
div {
	font-size:2px;
}
"""

miniTestRule = 'div{font-size:2px;}'
minifyLongerRule = miniTestRule + 'h2{font-family:Helvetica,Arial,Times New Roman;}'

exports.suite = vows.describe('CSS Sourcery').addBatch(
	'Minification':
		topic: () -> src.minify 
		'should remove comments': (topic) ->
			assert.equal topic('div{/* comments galore*/font-size:2px;}'), miniTestRule
		'should remove trailing whitespace': (topic) ->
			assert.equal topic('div{font-size:2px;} '), miniTestRule
		'should remove leading whitespace': (topic) ->
			assert.equal topic(' div{font-size:2px;}'), miniTestRule
		'should remove whitespace before colons': (topic) ->
			assert.equal topic('div{font-size :2px;}'), miniTestRule
		'should remove whitespace after colons': (topic) ->
			assert.equal topic('div{font-size: 2px;}'), miniTestRule
		'should remove whitespace before {': (topic) ->
			assert.equal topic('div {font-size:2px;}'), miniTestRule
		'should remove whitespace after {': (topic) ->
			assert.equal topic('div{ font-size:2px;}'), miniTestRule
		'should remove whitespace before }': (topic) ->
			assert.equal topic('div{font-size:2px; }'), miniTestRule
		'should remove whitespace after }': (topic) ->
			assert.equal topic('div{font-size:2px;} h2{font-family:Helvetica,Arial,Times New Roman;}'), minifyLongerRule
		'should remove whitespace before ;': (topic) ->
			assert.equal topic('div{font-size:2px ;}'), miniTestRule
		'should remove whitespace after ;': (topic) ->
			assert.equal topic('div{font-size:2px; color:#fff;}'), testRule
		'should remove whitespace before ,': (topic) ->
			assert.equal topic('div{font-size:2px;}h2{font-family:Helvetica ,Arial ,Times New Roman;}'), minifyLongerRule
		'should remove whitespace after ,': (topic) ->
			assert.equal topic('div{font-size:2px;}h2{font-family:Helvetica, Arial, Times New Roman;}'), minifyLongerRule


	'Rules':
		topic: () -> src.rule
		'without nesting':
			topic: (topic) -> topic
			'should generate nothing if they are empty': (topic) ->
				assert.equal src.minify(topic('div', []).compile({})), ''
			'should work with valid CSS properties as children': (topic) ->
				assert.equal(src.minify(topic('div', [
					'font-size:2px;'
					'color:#fff;'
				]).compile({})), testRule)
			'should allow CSS properties to leave out semicolons': (topic) ->
				assert.equal(src.minify(topic('div', [
					'font-size:2px'
					'color:#fff'
				]).compile({})), testRule)

			'should allow functions that return CSS properties as children': (topic) ->
				assert.equal(src.minify(topic('div', (params) ->
					['font-size:2px', 'color:#fff']
				).compile({})), testRule)

		'with nesting':
			topic: (topic) -> topic
			'should lift nested child rules': (topic) ->
				assert.equal(src.minify(topic('div', [
					'font-size:2px'
					topic 'h2', [
						'position:relative'
						'top:10px'
					]
				]).compile({})), nestedTestRule)

			'should lift nested child CSS string rules': (topic) ->
				assert.equal(src.minify(topic('div', [
					'font-size:2px'
					"""
					h2 {
						position:relative;
						top:10px;
					}
					"""
				]).compile({})), nestedTestRule)
			'should lift nested child functions that return rules': (topic) ->
				assert.equal(src.minify(topic('div', [
					'font-size:2px'
					(params) ->
						topic 'h2', [
							'position:relative'
							'top:10px'
						]
				]).compile({})), nestedTestRule)
			'should lift nested child functions that return CSS string rules': (topic) ->
				assert.equal(src.minify(topic('div', [
					'font-size:2px'
					(params) ->
						"""
						h2 {
							position:relative;
							top:10px;
						}
						"""
				]).compile({})), nestedTestRule)
		'with functions that take parameters':
			topic: (topic) -> topic
			'should pass the parameters to child functions': (topic) ->
				assert.equal(src.minify(topic('div', [
					(params) ->
						"font-size:#{params.size}"
					'color:#fff'
				]).compile({size: '2px'})), testRule)
			'should pass the parameters to functions of nested children': (topic) ->
				assert.equal(src.minify(topic('div', [
					'font-size:2px'
					topic 'h2', [
						(params) ->
							"position:#{params.position}"
						'top:10px'
					]
				]).compile({position:'relative'})), nestedTestRule)
		'with functions that don\'t take parameters':
			topic: (topic) -> topic
			'should allow parameters to be omitted': (topic) ->
				assert.equal(src.minify(topic('div', [
					'font-size:2px'
					'color:#fff'
				]).compile()), testRule)
	
	'Compilation':
		topic: () -> src.compile
		'should compile rules': (topic) ->
			assert.equal(src.minify(topic(src.rule('div', [
				'font-size:2px'
				'color:#fff'
			]), {})), testRule)
		'should allow parameters to be omitted': (topic) ->
			assert.equal(src.minify(topic(src.rule('div', [
				'font-size:2px'
				'color:#fff'
			]))), testRule)
		'should pass given parameters to children': (topic) ->
			assert.equal(src.minify(topic(src.rule('div', [
				'font-size:2px'
				(params) ->
					"color:#{params.color}"
			]), {color: '#fff'})), testRule)

)
