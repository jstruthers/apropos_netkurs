/*!
 * gulp
 * $ npm install watchify browserify gulp-plumber gulp-less gulp-autoprefixer gulp-cssmin gulp-rename gulp-uglify vinyl-source-stream vinyl-buffer gulp-util gulp-sourcemaps babelify lodash.assign browser-sync del --save-dev
 */
var watchify = require('watchify'),
	browserify = require('browserify'),
	gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	cssmin = require('gulp-cssmin'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	gutil = require('gulp-util'),
	sourcemaps = require('gulp-sourcemaps'),
	babelify = require('babelify'),
	assign = require('lodash.assign'),
	browserSync = require('browser-sync'),
	del = require('del'),

	customOpts = {
	    entries: ['./src/index.js'],
	    debug: true,
	    transform: [['babelify', { ignore: ["./src/libs/**"] }]],
	    ignore: ['./src/libs/**']
	},
	opts = assign({}, watchify.args, customOpts),
	b = watchify(browserify(opts));
 
b.on('log', gutil.log);
 
/**
 * This task removes all files inside the 'dist' directory.
 */
gulp.task('clean', function()
{
    del.sync('./dist/**/*');
});

/**
 * Copy all files from libs into 'dist/libs'.
 */
gulp.task('libs', ['clean'], function()
{
    return gulp.src(['./src/libs/*'])
        .pipe(plumber())
        .pipe(gulp.dest('./dist/libs'))
});

/**
 * Copy index.html into 'dist'.
 */
gulp.task('index', ['libs'], function()
{
    return gulp.src(['./src/index.html'])
        .pipe(plumber())
        .pipe(gulp.dest('./dist'));
});

// Styles
gulp.task('css', ['index'], function () {
  	return gulp.src('src/main.less')
		.pipe(less())
		.pipe(autoprefixer({
        	browsers: ['last 2 versions'],
        	cascade: false
    	}))
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./dist/css'));
});

/**
 * Bundle all js files and babelify them.
 */
gulp.task('bundle', ['css'], function() {
    return b.bundle()
        .on('error', function(err)
        {
            console.log(err.message);
            browserSync.notify(err.message, 3000);
            this.emit('end');
        })
        .pipe(plumber())
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});

/**
 * Watch the files inside 'src'. If a file is changed,
 * removed or added, then run refresh task which will run the bundle task
 * and then refresh the page.
 */
gulp.task('watch', ['bundle'], function()
{
    var watcher = gulp.watch('./src/**/*', ['refresh']);
    watcher.on('change', function(event)
    {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

/**
 * Allows refreshes to be called from the gulp bundle task.
 */
gulp.task('browser-sync', ['watch'], function()
{
    return browserSync({ server:  { baseDir: './dist' } });
});

/**
 * This is the default task which chains the rest.
 */
gulp.task('default', ['browser-sync']);

/**
 * Using a dependency ensures that the bundle task is finished before reloading.
 */
gulp.task('refresh', ['bundle'], browserSync.reload);
