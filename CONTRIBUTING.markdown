# Contributing

## Running Fuskr locally

We now use grunt to manage the project assets. Firstly, clone Fuskr and make sure you checkout the master branch.

Run `npm install` to download all of the tooling followed by `grunt build` to generate a release folder.

### Loading unpacked extension in chrome

When loading the extension into Chrome, be sure to choose the `/dist` folder as the extension directory.

You shouldn't have to reload the extension when you make file changes (unless you're updating the manifest).

## Grunt tasks

There are a lot of tasks but the main one would be just running `grunt`.

The `default` task will initially build the project and then watch the files for any changes. If you update any files then it will rebuild and run any necessary tasks (i.e. sass will be run for any sass changes, a rebuild will be done for JS files with tests executed).

`grunt lint` - Only run the linters
`grunt compile` - Only run what's needed to build the dist (no tests/lints)
`grunt build` - Build a full dist folder with any debugging information (i.e. sourcemaps)
`grunt release` - Do everything. Run all lints, tests, compile tasks, etc. Clean the dist folder of unnecessary files and build a zip file ready for release

## Linting

For JavaScript, JSCS and JSHint are both used to check the non-vendor code. Sass gets checked by sass-lint.

All 3 linters have their configuration files in the root of the repository.

## Testing

Tests are run automatically on build. If you aren't using the grunt watcher and just want a quick test on the non-release version of the code, then run `grunt test`. This will execute the tests and can be useful to debug tests run on the release files.

### Writing tests

The tests that will be run will use the jasmine framework. Any file in the `Tests` folder ending in `*.spec.js` will be run.
