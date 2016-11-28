var gulp = require("gulp"),

	less = require("gulp-less"),
	cssmin = require("gulp-cssmin"),
	rename = require("gulp-rename"),
	LessAutoprefix = require('less-plugin-autoprefix'),
	autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] }),

	flatten = require("gulp-flatten"),
	plumber = require("gulp-plumber"),
	gutil = require("gulp-util"),
	del = require('del'),

	browserSync = require("browser-sync");

gulp.task('clean', function()
{
    del.sync('./dist/**/*');
});

gulp.task("libs", ["clean"], function (){
	return gulp.src('src/libs/**')
		.pipe(plumber())
		.pipe(gulp.dest("dist/libs"));
});

gulp.task("fonts", ["libs"], function (){
    return gulp.src('src/libs/fonts/**')
        .pipe(plumber())
        .pipe(gulp.dest("dist/fonts"));
});

gulp.task("copy-html", ["fonts"], function () {
    return gulp.src('./src/html/*.html')
    	.pipe(plumber())
    	.pipe(flatten())
        .pipe(gulp.dest("dist/html"));
});

gulp.task("copy-index", ["copy-html"], function () {
    return gulp.src('./src/index.html')
    	.pipe(plumber())
        .pipe(gulp.dest("dist"));
});

gulp.task("copy-js", ["copy-index"], function () {
    return gulp.src('./src/index.js')
    	.pipe(plumber())
        .pipe(gulp.dest("dist"));
});

gulp.task("copy-json", ["copy-js"], function () {
    return gulp.src('./src/json/*.json')
    	.pipe(plumber())
        .pipe(gulp.dest("dist/json"));
});

gulp.task('less', ["copy-json"], function () {
    return gulp.src('./src/index.less')
	    .pipe(plumber())
	    .pipe(less({
	      	plugins: [autoprefix]
	    }))
	    // .pipe(cssmin())
	    // .pipe(rename({suffix: '.min'}))
	    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['less'], function()
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
gulp.task('refresh', ['less'], browserSync.reload);
