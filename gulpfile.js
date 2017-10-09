/* MAIN */
var gulp = require('gulp');
var plumber = require('gulp-plumber');

/*STYLES*/
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var csscomb = require('gulp-csscomb');
var gcmq = require('gulp-group-css-media-queries');
var browserSync = require('browser-sync').create();

/*SCRIPTS*/
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

/*UPLOAD*/
var ftp = require('vinyl-ftp');
var gutil = require('gulp-util');


// fetch command line arguments 
//@author https://www.sitepoint.com/pass-parameters-gulp-tasks/
const arg = (argList => {
	let arg = {},
		a, opt, thisOpt, curOpt;
	for (a = 0; a < argList.length; a++) {
		thisOpt = argList[a].trim();
		opt = thisOpt.replace(/^\-+/, '');
		if (opt === thisOpt) {
			// argument value
			if (curOpt) arg[curOpt] = opt;
			curOpt = null;
		} else {
			// argument name
			curOpt = opt;
			arg[curOpt] = true;
		}
	}
	return arg;
})(process.argv);


// Standardtask, SASS und Scripts
gulp.task('serve', ['sass', 'scripts'], function () {
	browserSync.init({
		// Proxy auf Apache Port
		proxy: 'localhost:8888/projects/heringsdorf/'
	});
	gulp.watch("system/modules/vimo/assets/vendor/gulpsrc/scripts/**/*.js", ['scripts']);
	gulp.watch("system/modules/vimo/assets/vendor/gulpsrc/styles/**/*.scss", ['sass']);
});


// SCSS Task, Kompiliert .CSS Datei
gulp.task('sass', function () {
	gulp.src("system/modules/vimo/assets/vendor/gulpsrc/styles/**/*.scss")
		.pipe(plumber({
			errorHandler: function (error) {
				console.log(error.message);
				this.emit('end');
			}
		}))
		.pipe(sass())
		.pipe(autoprefixer())
    .pipe(csscomb())
		.pipe(gcmq())
		.pipe(gulp.dest("files/theme/css"))
		.pipe(browserSync.stream())
});

// Script Task, Fügt Dateien Zusammen und verkleinert diese
gulp.task('scripts', function () {
	gulp.src("system/modules/vimo/assets/vendor/gulpsrc/scripts/**/*.js")
		.pipe(plumber({
			errorHandler: function (error) {
				console.log(error.message);
				this.emit('end');
			}
		}))
		.pipe(concat("main.js"))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(gulp.dest("files/theme/js"))
		.pipe(browserSync.stream())
});

// ### Vinyl FTP Staging
gulp.task('staging', function () {
	var conn = ftp.create({
		host: 'ftp.vicon-intern.de',
		user: 'w00f41bb',
		// Password muss über CMD/Terminal übergeben werden
		password: arg.p,
		parallel: 3,
		maxConnections: 3,
		log: gutil.log,
		secure: true,
		secureOptions: {
			rejectUnauthorized: false
		},
		idleTimeout: 200
	});
	var globs = [
		// zu kopierende Dateien
		'*',
		'vendor/**',
		'templates/**',
		'system/**',
		'share/**',
		'files/**',
		'contao/**',
		'composer/**',
		'assets/**',
		'!assets/css/*',
		'!composer/cache/**',
		'!system/logs/*',
		'!kundenprojekte',
		'!kundenprojekte/**',
		'!.git',
		'!*.json',
		'!*.md',
		'!*.xml',
		'!gulpfile.js',
		'!node_modules',
		'!node_modules/**',
	];
	return gulp.src(globs, {
			base: '.',
			buffer: false
		})
		.pipe(conn.newer('/webdata/kundenprojekte/' + arg.n + '/contao')) // nur neuere Dateien hochladen
		.pipe(conn.dest('/webdata/kundenprojekte/' + arg.n + '/contao'));
});

// ### Vinyl FTP deployment
gulp.task('deployment', function () {
	var conn = ftp.create({
		// Variablen über CMD/Terminal
		host: arg.h,
		user: arg.u,
		password: arg.p,
		parallel: 3,
		log: gutil.log
	});
	var globs = [
		// zu kopierende Dateien
		'*',
		'vendor/**',
		'templates/**',
		'system/**',
		'share/**',
		'files/**',
		'contao/**',
		'composer/**',
		'assets/**',
		'!kundenprojekte/**',
		'!.git',
		'!*.json',
		'!*.md',
		'!*.xml',
		'!gulpfile.js',
		'!node_modules',
		'!node_modules/**',
	];
	return gulp.src(globs, {
			base: '.',
			buffer: false
		})
		.pipe(conn.newer('/webdata/contao')) // nur neuere Dateien hochladen
		.pipe(conn.dest('/webdata/contao'));
});


gulp.task('default', ['serve']);