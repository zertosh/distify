var test = require('tap').test;
var vm = require('vm');
var concat = require('concat-stream');

var insert = require('../../lib/insert-module-globals');
var bpack = require('../../lib/browser-pack');
var mdeps = require('../../lib/module-deps');

test('insert globals', function (t) {
    var expected = [ 'global' ];
    t.plan(2 + expected.length);
    
    var deps = mdeps({ transform: function (file) {
        var tr = inserter(file)
        tr.on('global', function (name) {
            t.equal(name, expected.shift());
        });
        return tr;
    } });
    var pack = bpack({ raw: true });
    
    deps.pipe(pack);
    
    pack.pipe(concat(function (src) {
        var c = {
            t : t,
            a : 555,
        };
        c.self = c;
        vm.runInNewContext(src, c);
    }));
    
    deps.end(__dirname + '/global/main.js');
});

test('__filename and __dirname', function (t) {
    t.plan(2);
    
    var file = __dirname + '/global/filename.js';
    var deps = mdeps({ transform: inserter });
    var pack = bpack({ raw: true });
    
    deps.pipe(pack);
    
    pack.pipe(concat(function (src) {
        var c = {};
        vm.runInNewContext('require=' + src, c);
        var x = c.require(file);
        t.equal(x.filename, '/filename.js');
        t.equal(x.dirname, '/');
    }));
    
    deps.end(file);
});

function inserter (file) {
    return insert(file, { basedir: __dirname + '/global' });
}