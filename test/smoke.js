var css, template;
css = require('../index');
template = [
  css.rule('.sourcery', [
    'color:#999', 'font-family: Helvetica, Arial, sans-serif', css.ul([
      'list-style-type:none', function(params) {
        if (params.dumbledore) {
          return 'color:yellow';
        } else {
          return 'color:black';
        }
      }
    ]), css.nav([css.a([css.rule(':hover', 'color:red'), css.rule(':visited', 'color:black'), 'color:black'])])
  ]), "h2 {\n	font-size:40px;\n	color:#666;\n}"
];
console.log(css.compile(template, {
  dumbledore: false
}));