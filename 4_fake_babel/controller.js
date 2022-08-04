const parseJSX = require('./parser.js')

const transform = require('./transform.js')

var fs = require("fs");

const App = require('./jsx.js');

// var App;
// fs.readFile('jsx.js', function (err, data) {
//    if (err) {
//        return console.error(err);
//    }
//    App = data.toString();
//    console.log(App);
// });

let root = parseJSX(App);

let tree = JSON.stringify(root, null, 2);

fs.writeFile('tree.json', tree,  function(err) {
    if (err) {
        return console.error(err);
    }
});

//console.log(JSON.stringify(root, null, 2));

let code = transform(root);

fs.writeFile('code.js', code,  function(err) {
    if (err) {
        return console.error(err);
    }
});
