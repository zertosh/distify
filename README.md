# distify

Experimental browserify-based (mostly backwards-compatible) AST-aware module packager.

## Idea

### Architecture

Browserify transforms exist in two categories:

  1. _nonjs_-to-_js_ transforms (henceforth "converters").
    * The source cannot be expressed in terms of an esprima-compatible AST because they're not js.
    * e.g.: handlebars/underscore templates compilers, coffeeify, jadeify, etc.

  2. _js_-to-_js_ transforms (not converters, henceforth "legacy transforms").
    * The source can be expressed in terms of an esprima AST because they're js.
    * These most often do use an AST as intermediate step, but it's not shared.
    * [babelify](https://github.com/babel/babelify), [brfs](https://github.com/substack/brfs) (inlines `fs.readFileSync()` calls), [aliasify](https://github.com/benbria/aliasify) (remaps `require` calls), [envify](https://github.com/hughsk/envify) (inlines `process.env` values), [deAMDify](https://github.com/jaredhanson/deamdify), etc.


Internally, browserify has three _legacy transforms_:

  1. [detective](https://github.com/substack/node-detective). Collects require calls.
  2. [insert-module-globals](https://github.com/substack/insert-module-globals). Wraps modules in an IIFE with references to `__filename`, `__dirname`, `process` and `Buffer` - if needed.
  3. [syntax-error](https://github.com/substack/node-syntax-error). Syntax checks files – uses acorn's own errors to present helpful messages with line numbers.

_Converters_ are exogenous inputs into the build pipeline. However, _Legacy transforms_ are AST transformations that can benefit from skipping the AST-building step.


```
  + nonjs-to-js: If Acorn can't read it, these turn it
  | into something that it can. Includes the above mentioned, plus:
  |   * Turning `.json` files into `module.exports=JSON_CONTENT`.
  |   * BOM and shebang stripping.
  |
  |                 : 1. acorn
  |                 : 2. babel transforms
  |                 : 3. babel code gen
  |                 :
  v                 !~~~~~~~~~~~~~~~~!
converters -> JS -> !  AST  ->  JS+  ! -> legacy transforms -> packaging
                    !________________!                            ^
                    ^                                             |
                    |                                   * bundle splitting,
                    |                                   * source maps, etc.
                    |
                    |
                    * babel & it's ES6/7 transforms
                    * user defined transforms
                    * internal transforms rewritten as babel plugins
                    * other transforms like: bundle-collapser, aliasify
```
