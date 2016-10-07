var gulp = require("gulp"),

	less = require("gulp-less"),
	cssmin = require("gulp-cssmin"),
	rename = require("gulp-rename"),

	prefix = require("gulp-autoprefixer"),
	browserify = require("browserify"),
	watchify = require("watchify"),
	uglify = require('gulp-uglify'),

	gutil = require("gulp-util"),
	del = require('del'),
	plumber = require("gulp-plumber"),
	assign = require("lodash.assign"),

	browserSync = require("browser-sync"),
	sourcemaps = require('gulp-sourcemaps'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),

	paths = {
		pages: ['src/index.html']
	},

	customOpts = {
		basedir: '.',
		debug: true,
        entries: ['src/index.js'],
        plugin: [watchify],
        //	Expose libraries by attatching them to the window object
        insertGlobalVars: {
        	$: function(file, dir) {
        		return require("./src/libs/jquery-1.12.4.min.js");
        	},
        	store: function(file, dir) {
        		return require("./src/js/store.js");
        	}
        },
        cache: {},
        packageCache: {},
        ignore: ['./src/libs/**']
	},
	opts = assign({}, watchify.args, customOpts),
	b = watchify(browserify(opts));

b.on("log", gutil.log);

gulp.task('clean', function()
{
    del.sync('./dist/**/*');
});

gulp.task("libs", ["clean"], function (){
	return gulp.src('src/libs/**')
		.pipe(plumber())
		.pipe(gulp.dest("dist/libs"));
});

gulp.task("copy-html", ["libs"], function () {
    return gulp.src(paths.pages)
    	.pipe(plumber())
        .pipe(gulp.dest("dist"));
});

gulp.task('less', ["copy-html"], function () {
    return gulp.src('./src/index.css')
	    .pipe(plumber())
	    .pipe(less({
	      paths: ['./src/**/*.less']
	    }))
	    .pipe(prefix('last 2 versions', 'ie 9'))
	    .pipe(cssmin())
	    .pipe(rename({suffix: '.min'}))
	    .pipe(gulp.dest('dist'));
});

gulp.task('bundle', ['less'], function()
{
	return b.bundle()
		.on('error', function(err)
        {
        	gutil.log(
        		gutil.colors.red("Browserify compile error:"),
        		err.stack,
        		err.message );
            browserSync.notify(err.message, 3000);
            this.emit('end');
		})
		.pipe(plumber())
	    .pipe(source('bundle.js'))
	    .pipe(buffer())
    	.pipe(sourcemaps.init({loadMaps: true}))
    	.pipe(uglify())
    	.pipe(sourcemaps.write('./'))
	    .pipe(gulp.dest("dist"));
});

gulp.task('watch', ['bundle'], function()
{
    var watcher = gulp.watch('./src/**/*', ['refresh']);
    watcher.on('change', function(event)
    {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

/**
 * Allow refresh to be called from the gulp bundle task.
 */
gulp.task('browser-sync', ['watch'], function()
{
    return browserSync({ server:  { baseDir: './dist' } });
});

gulp.task('default', ['browser-sync']);

/**
 * Using a dependency ensures that the bundle task is finished before reloading.
 */
gulp.task('refresh', ['bundle'], browserSync.reload);
