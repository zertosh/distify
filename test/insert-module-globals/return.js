var test = require('tap').test;
var mdeps = require('../../lib/module-deps');
var bpack = require('../../lib/browser-pack');
var insert = require('../../lib/insert-module-globals');
var concat = require('concat-stream');
var vm = require('vm');

test('early return', function (t) {
    t.plan(4);
    var s = mdeps()
    s.pipe(bpack({ raw: true })).pipe(concat(function (src) {
        var c = {
            t: t,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout
        };
        vm.runInNewContext(src, c);
    }));
    s.write({ transform: inserter, global: true });
    s.end(__dirname + '/return/main.js');
});

function inserter (file) {
    return insert(file, {
        basedir: __dirname + '/return'
    });
}
