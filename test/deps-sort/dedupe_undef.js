var sort = require('../../lib/deps-sort');
var test = require('tap').test;
var through = require('through2');

test('dedupe undef', function (t) {
    t.plan(1);
    var s = sort({ dedupe: true });
    var rows = [];
    function write (row, enc, next) { rows.push(row); next() }
    function end () {
        t.deepEqual(rows, [
            { id: '/bar.js', source: 'TWO' },
            { id: '/foo.js', source: 'TWO', dedupe: '/bar.js', sameDeps: true },
            {
                id: '/main.js',
                deps: { './foo': '/foo.js', './bar': '/bar.js' },
                source: 'ONE'
            }
        ]);
    }
    s.pipe(through.obj(write, end));
    
    s.write({
        id: '/main.js',
        deps: { './foo': '/foo.js', './bar': '/bar.js' },
        source: 'ONE'
    });
    s.write({
        id: '/foo.js',
        source: 'TWO'
    });
    s.write({
        id: '/bar.js',
        source: 'TWO'
    });
    s.end();
});
