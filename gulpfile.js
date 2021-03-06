var env = process.env.NODE_ENV || 'development',
	gulp = require('gulp'),
	browserify = require('browserify'),
	reactify = require('reactify'),
	transform = require('vinyl-transform'),
	nodemon = require('gulp-nodemon'),
	livereload = require('gulp-livereload'),
	stylus = require('gulp-stylus'),
	openWindow = require('gulp-open'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	jasmine = require('gulp-jasmine'),
	paths = require('./configs/paths')[env],
	serverConf = require('./configs/server')[env];

/**
 * Sets up browserify bundling for the development environment.
 * Bundles and creates a file at the scripts folder in the assets directory.
 */
gulp.task('clientjs:dev', function() {
	var browserified = transform(function(filename) {
		var b = browserify(filename);
		b.transform(reactify, {extension: 'jsx'});
		return b.bundle();
	});

	return gulp.src(paths.source.clientMainScript)
		.pipe(browserified)
		.pipe(rename(paths.dist.clientMainScript))
		.pipe(gulp.dest(paths.dist.clientBundle));
});

/**
 * Sets up browserify bundling for the production environment.
 * Bundles, minify and creates a file at the scripts folder in the assets directory.
 */
gulp.task('clientjs:prod', function() {
	var browserified = transform(function(filename) {
		var b = browserify(filename);
		b.transform(reactify, {extension: 'jsx'});
		return b.bundle();
	});

	return gulp.src(paths.source.clientMainScript)
		.pipe(browserified)
		.pipe(uglify())
		.pipe(rename(paths.dist.clientMainScript))
		.pipe(gulp.dest(paths.dist.clientBundle));
});

/**
 * Sets up stylus compilation and bundling for the development environment.
 * Compiles, bundle and creates a file at the styles folder in the assets directory.
 */
gulp.task('styles:dev', function() {
	return gulp.src(paths.source.stylesMain)
        .pipe(stylus())
        .pipe(gulp.dest(paths.dist.styles));
});

/**
 * Sets up stylus compilation and bundling for the production environment.
 * Compiles, bundle, compress and creates a file at the styles folder in the assets directory.
 */
gulp.task('styles:prod', function() {
	return gulp.src(paths.source.stylesMain)
        .pipe(stylus({
        	compress: true
        }))
        .pipe(gulp.dest(paths.dist.styles));
});

/**
 * Builds the project for the development environment.
 */
gulp.task('build:dev',['clientjs:dev', 'styles:dev']);

/**
 * Builds the project for the production environment.
 */
gulp.task('build:prod', ['clientjs:prod', 'styles:prod']);

/**
 * Starts the server and monitor for any change, reloading the server and browser if any changes occur.
 */
gulp.task('serve:dev', ['build:dev'], function(done) {
	var serverStarted = false;

	livereload.listen();

	return nodemon({
		verbose: true,
		script: 'server.js',
		ext: 'js jsx jade styl',
		env: {'NODE_ENV': 'development', port: serverConf.port},
		ignore: paths.unwatchedFiles
	})
	.on('start', function() {
		if (!serverStarted) {
			done();

			serverStarted = true;
		}
	})
	.on('change', ['build:dev'])
	.on('restart', function() {
		console.log('Server restarted.');

		setTimeout(function() {
			livereload.changed();
		}, 150);
	});
});

/**
 * Starts the server for the production environment
 */
gulp.task('serve:prod', ['build:prod'], function() {
	nodemon({
		script: 'server.js',
		ext: 'js jsx jade styl',
		env: {'NODE_ENV': 'production', port: serverConf.port},
		ignore: paths.unwatchedFiles
	})
	.on('change', ['build:prod'])
	.on('restart', function() {
		console.log('Server restarted.');
	});
});

/**
 * Opens a browser at the server url
 */
gulp.task('start:development', ['serve:dev'], function() {
	return gulp.src(paths.source.clientMainScript)
		.pipe(openWindow('', {url: serverConf.url}))
});

/**
 * Run the tests in the test folder
 */
gulp.task('tests', function() {
	return gulp.src(paths.testsBlob)
		.pipe(jasmine());
});

/**
 * Sets the default task
 */
gulp.task('default', [env === 'development' ? 'start:development' : 'serve:prod']);