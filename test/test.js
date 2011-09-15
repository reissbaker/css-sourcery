var assert, miniTestRule, minifyLongerRule, nestedTestRule, src, testRule, vows;
vows = require('vows');
src = require('../index');
assert = require('assert');
testRule = 'div{font-size:2px;color:#fff;}';
nestedTestRule = src.minify("div h2 {\n	position:relative;\n	top:10px;\n}\ndiv {\n	font-size:2px;\n}");
miniTestRule = 'div{font-size:2px;}';
minifyLongerRule = miniTestRule + 'h2{font-family:Helvetica,Arial,Times New Roman;}';
exports.suite = vows.describe('CSS Sourcery').addBatch({
  'Minification': {
    topic: function() {
      return src.minify;
    },
    'should remove comments': function(topic) {
      return assert.equal(topic('div{/* comments galore*/font-size:2px;}'), miniTestRule);
    },
    'should remove trailing whitespace': function(topic) {
      return assert.equal(topic('div{font-size:2px;} '), miniTestRule);
    },
    'should remove leading whitespace': function(topic) {
      return assert.equal(topic(' div{font-size:2px;}'), miniTestRule);
    },
    'should remove whitespace before colons': function(topic) {
      return assert.equal(topic('div{font-size :2px;}'), miniTestRule);
    },
    'should remove whitespace after colons': function(topic) {
      return assert.equal(topic('div{font-size: 2px;}'), miniTestRule);
    },
    'should remove whitespace before {': function(topic) {
      return assert.equal(topic('div {font-size:2px;}'), miniTestRule);
    },
    'should remove whitespace after {': function(topic) {
      return assert.equal(topic('div{ font-size:2px;}'), miniTestRule);
    },
    'should remove whitespace before }': function(topic) {
      return assert.equal(topic('div{font-size:2px; }'), miniTestRule);
    },
    'should remove whitespace after }': function(topic) {
      return assert.equal(topic('div{font-size:2px;} h2{font-family:Helvetica,Arial,Times New Roman;}'), minifyLongerRule);
    },
    'should remove whitespace before ;': function(topic) {
      return assert.equal(topic('div{font-size:2px ;}'), miniTestRule);
    },
    'should remove whitespace after ;': function(topic) {
      return assert.equal(topic('div{font-size:2px; color:#fff;}'), testRule);
    },
    'should remove whitespace before ,': function(topic) {
      return assert.equal(topic('div{font-size:2px;}h2{font-family:Helvetica ,Arial ,Times New Roman;}'), minifyLongerRule);
    },
    'should remove whitespace after ,': function(topic) {
      return assert.equal(topic('div{font-size:2px;}h2{font-family:Helvetica, Arial, Times New Roman;}'), minifyLongerRule);
    }
  },
  'Rules': {
    topic: function() {
      return src.rule;
    },
    'without nesting': {
      topic: function(topic) {
        return topic;
      },
      'should generate nothing if they are empty': function(topic) {
        return assert.equal(src.minify(topic('div', []).compile({})), '');
      },
      'should work with valid CSS properties as children': function(topic) {
        return assert.equal(src.minify(topic('div', ['font-size:2px;', 'color:#fff;']).compile({})), testRule);
      },
      'should allow CSS properties to leave out semicolons': function(topic) {
        return assert.equal(src.minify(topic('div', ['font-size:2px', 'color:#fff']).compile({})), testRule);
      },
      'should allow functions that return CSS properties as children': function(topic) {
        return assert.equal(src.minify(topic('div', function(params) {
          return ['font-size:2px', 'color:#fff'];
        }).compile({})), testRule);
      },
      'should allow arrays of CSS properties as children': function(topic) {
        return assert.equal(src.minify(topic('div', [['font-size:2px', 'color:#fff']]).compile({})), testRule);
      },
      'should allow valid CSS to be passed instead of an array': function(topic) {
        return assert.equal(src.minify(topic('div', 'font-size:2px;color:#fff;').compile({})), testRule);
      },
      'should allow functions to be passed instead of an array': function(topic) {
        return assert.equal(src.minify(topic('div', function(params) {
          return 'font-size:2px;color:#fff;';
        }).compile({})), testRule);
      }
    },
    'with nesting': {
      topic: function(topic) {
        return topic;
      },
      'should lift nested child rules': function(topic) {
        return assert.equal(src.minify(topic('div', ['font-size:2px', topic('h2', ['position:relative', 'top:10px'])]).compile({})), nestedTestRule);
      },
      'should correctly lift nested child pseudo-classes': function(topic) {
        return assert.equal(src.minify(topic('a', [topic(':hover', 'color:red')]).compile({})), 'a:hover{color:red;}');
      },
      'should lift nested child CSS string rules': function(topic) {
        return assert.equal(src.minify(topic('div', ['font-size:2px', "h2 {\n	position:relative;\n	top:10px;\n}"]).compile({})), nestedTestRule);
      },
      'should lift nested child functions that return rules': function(topic) {
        return assert.equal(src.minify(topic('div', [
          'font-size:2px', function(params) {
            return topic('h2', ['position:relative', 'top:10px']);
          }
        ]).compile({})), nestedTestRule);
      },
      'should lift nested child functions that return CSS string rules': function(topic) {
        return assert.equal(src.minify(topic('div', [
          'font-size:2px', function(params) {
            return "h2 {\n	position:relative;\n	top:10px;\n}";
          }
        ]).compile({})), nestedTestRule);
      }
    },
    'with functions that take parameters': {
      topic: function(topic) {
        return topic;
      },
      'should pass the parameters to child functions': function(topic) {
        return assert.equal(src.minify(topic('div', [
          function(params) {
            return "font-size:" + params.size;
          }, 'color:#fff'
        ]).compile({
          size: '2px'
        })), testRule);
      },
      'should pass the parameters to functions of nested children': function(topic) {
        return assert.equal(src.minify(topic('div', [
          'font-size:2px', topic('h2', [
            function(params) {
              return "position:" + params.position;
            }, 'top:10px'
          ])
        ]).compile({
          position: 'relative'
        })), nestedTestRule);
      }
    },
    'with functions that don\'t take parameters': {
      topic: function(topic) {
        return topic;
      },
      'should allow parameters to be omitted': function(topic) {
        return assert.equal(src.minify(topic('div', ['font-size:2px', 'color:#fff']).compile()), testRule);
      }
    }
  },
  'Compilation': {
    topic: function() {
      return src.compile;
    },
    'should compile rules': function(topic) {
      return assert.equal(src.minify(topic(src.rule('div', ['font-size:2px', 'color:#fff']), {})), testRule);
    },
    'should allow parameters to be omitted': function(topic) {
      return assert.equal(src.minify(topic(src.rule('div', ['font-size:2px', 'color:#fff']))), testRule);
    },
    'should pass given parameters to children': function(topic) {
      return assert.equal(src.minify(topic(src.rule('div', [
        'font-size:2px', function(params) {
          return "color:" + params.color;
        }
      ]), {
        color: '#fff'
      })), testRule);
    }
  }
});