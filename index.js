/*
	Utility functions.
	==================
*/
var Rule, buildRule, compile, concatenateAll, ensureSemicolon, getMatches, getRules, getStyles, isArray, lift, minify, needsLift, precompile, rule, singleSpace, style, tag, tags, trim, typeOf, _i, _len;
isArray = function(value) {
  var s;
  s = typeof value;
  if (s === 'object' && value && value instanceof Array) {
    return true;
  }
  return false;
};
typeOf = function(value) {
  if (isArray(value)) {
    return 'array';
  }
  return typeof value;
};
trim = function(string) {
  return string.replace(/^\s+|\s+$/g, '');
};
singleSpace = function(string) {
  return string.replace(/\s+/g, ' ');
};
minify = function(string) {
  return singleSpace(trim(string.replace(/\/\*(?:.|\s)*?\*\//g, ''))).replace(/\s+:/g, ':').replace(/:\s+/g, ':').replace(/\{\s+/g, '{').replace(/\s+\}/g, '}').replace(/\s+\./g, '.').replace(/\s+#/g, '#').replace(/\s+\{/g, '{').replace(/\}\s+/g, '}').replace(/;\s+/g, ';').replace(/\s+;/g, ';').replace(/,\s+/g, ',').replace(/\s+,/g, ',');
};
concatenateAll = function(array) {
  var cat, s, _i, _len;
  cat = '';
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    s = array[_i];
    cat += s;
  }
  return cat;
};
/*
	Patterns.
	=========
*/
style = /[a-zA-Z\-]+\s*:\s*[^:;]+;/g;
rule = /[^:\{\}]+\s*\{\s*[^\}]+\s*\}/g;
getMatches = function(string, regex) {
  var match, matches, trimmed, _i, _len;
  matches = string.match(regex);
  trimmed = [];
  if (matches) {
    for (_i = 0, _len = matches.length; _i < _len; _i++) {
      match = matches[_i];
      trimmed.push(trim(match));
    }
  }
  return trimmed;
};
getStyles = function(string) {
  return getMatches(string, style);
};
getRules = function(string) {
  return getMatches(string, rule);
};
ensureSemicolon = function(styleString) {
  return styleString.replace(/\s*$/, ';').replace(/;;/, ';');
};
/*
	Compilation.
	============
*/
precompile = function(content, params) {
  var c, precompiled, _i, _len;
  if (typeOf(content) === 'array') {
    precompiled = [];
    for (_i = 0, _len = content.length; _i < _len; _i++) {
      c = content[_i];
      precompiled.push(precompile(c, params));
    }
    return precompiled;
  }
  if (typeOf(content) === 'string') {
    return content;
  }
  if (typeOf(content) === 'function') {
    return precompile(content(params));
  }
  return new Rule(content.selector, precompile(content.styles, params));
};
needsLift = function(content) {
  if (typeOf(content) === 'string') {
    if (getRules(content).length !== 0) {
      return true;
    }
    return false;
  }
  return true;
};
lift = function(content) {
  var c, child, combinedSelector, filtered, lifted, liftedChild, liftedChildren, r, rules, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref;
  lifted = [];
  if (typeOf(content) === 'array') {
    for (_i = 0, _len = content.length; _i < _len; _i++) {
      c = content[_i];
      lifted = lifted.concat(lift(c));
    }
    return lifted;
  }
  if (typeOf(content) === 'string') {
    lifted.push(content);
    return lifted;
  }
  filtered = new Rule(content.selector, []);
  _ref = content.styles;
  for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
    child = _ref[_j];
    liftedChildren = lift(child);
    for (_k = 0, _len3 = liftedChildren.length; _k < _len3; _k++) {
      liftedChild = liftedChildren[_k];
      if (needsLift(liftedChild)) {
        if (typeOf(liftedChild) === 'string') {
          rules = getRules(liftedChild);
          for (_l = 0, _len4 = rules.length; _l < _len4; _l++) {
            r = rules[_l];
            lifted.push(content.selector + ' ' + r);
          }
        } else {
          combinedSelector = content.selector + (liftedChild.selector.charAt(0) !== ':' ? ' ' : '') + liftedChild.selector;
          lifted.push(new Rule(combinedSelector, liftedChild.styles));
        }
      } else {
        filtered.styles.push(ensureSemicolon(liftedChild));
      }
    }
  }
  if (filtered.styles.length > 0) {
    lifted.push(filtered);
  }
  return lifted;
};
compile = function(content, depth) {
  var compiled, s, _i, _len;
  if (typeOf(content) === 'array') {
    compiled = '';
    for (_i = 0, _len = content.length; _i < _len; _i++) {
      s = content[_i];
      compiled += compile(s, depth);
    }
    return compiled;
  }
  if (typeOf(content) === 'string') {
    if (depth > 0) {
      return "\n\t" + content;
    } else {
      return "\n" + content;
    }
  }
  return ("\n" + content.selector + " {") + compile(content.styles, depth + 1) + "\n}";
};
/*
	Classes.
	========
*/
Rule = (function() {
  function Rule(selector, styles) {
    this.selector = selector;
    if (!isArray(styles)) {
      this.styles = [styles];
    } else {
      this.styles = styles;
    }
  }
  Rule.prototype.compile = function(params) {
    if (!params) {
      params = {};
    }
    return compile(lift(precompile(this, params)), 0);
  };
  return Rule;
})();
/*
 Exports.
 ========
*/
exports.compile = function(content, params) {
  if (params) {
    return compile(lift(precompile(content, params)), 0);
  } else {
    return compile(lift(precompile(content, {})), 0);
  }
};
exports.minify = function(string) {
  return minify(string);
};
exports.concatenate = function(array) {
  return concatenateAll(array);
};
exports.rule = function(selector, styles) {
  return new Rule(selector, styles);
};
buildRule = function(selector) {
  return function(styles) {
    return exports.rule(selector, styles);
  };
};
tags = ['a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bb', 'bdo', 'blockquote', 'body', 'button', 'canvas', 'caption', 'cite', 'code', 'colgroup', 'datagrid', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'html', 'i', 'iframe', 'ins', 'kbd', 'label', 'legend', 'li', 'map', 'mark', 'menu', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 'samp', 'script', 'section', 'select', 'small', 'span', 'strong', 'style', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'ul', 'var', 'video', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source'];
for (_i = 0, _len = tags.length; _i < _len; _i++) {
  tag = tags[_i];
  exports[tag] = buildRule(tag);
}