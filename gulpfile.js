'use strict';

const gulp		= require('gulp'),
	$			= require('gulp-load-plugins')(),
	del			= require('del'),
	browserSync = require('browser-sync');
	
require('dotenv').load();
	
const paths = {
	scripts: ['src/scripts/vendor/*.js', 'src/scripts/app/*.js', 'src/scripts/app.js'],
	styles: 'src/styles/**/*.scss',
	images: 'src/images/**/*.{png,jpeg,jpg,gif}',
	extras: ['src/*.*', 'src/fonts/**/*'],
	dest: {
		scripts : 'dist/js',
		styles: 'dist/css',
		images: 'dist/img',
		extras: 'dist'
	}
};

gulp.task('lint', function () {
	return gulp.src(['server.js', 'app/**/*.js', 'src/scripts/app/*.js', 'src/scripts/app.js'])
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['lint'], function () {
	const file = 'app.min.js';
	
	return gulp.src(paths.scripts)
		.pipe($.plumber())
		.pipe($.newer(paths.dest.scripts + file))
		.pipe($.uglifyjs(file, {
			outSourceMap: !$.util.env.production,
			sourceRoot: '../'
		}))
		.pipe(gulp.dest(paths.dest.scripts));
});

gulp.task('styles', function () {
	return gulp.src(paths.styles)
		.pipe($.plumber())
		//.pipe($.newer({dest: paths.dest.styles + 'style.css', ext: '.css'}))
		.pipe($.sass({
			outputStyle: $.util.env.production ? 'compressed' : 'nested',
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer())
		.pipe(gulp.dest(paths.dest.styles));
});

gulp.task('images', function () {
	return gulp.src(paths.images)
		.pipe($.plumber())
		.pipe($.newer(paths.dest.images))
		.pipe($.imagemin({
			optimizationLevel: $.util.env.production ? 5 : 1,
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest(paths.dest.images));
});

gulp.task('extras', function () {
	return gulp.src(paths.extras)
		.pipe($.newer(paths.dest.extras))
		.pipe(gulp.dest(paths.dest.extras));
});

gulp.task('clean', function () {
	return del([paths.dest.extras]);
});

gulp.task('serve', ['watch'], function () {
	browserSync({
		files: [ 'app/**/*.html', 'dist/**', '!dist/**/*.map' ],
		proxy: 'localhost:3000',
		port: 3001,
		open: !$.util.env.no
	});
});

gulp.task('express', function () {
	return $.nodemon({ 
		script: 'server.js', 
		ext: 'html js', 
		watch: ['app', 'server.js'],
	})
	.on('restart', function () {
		console.log('restarted!');
	});
})

gulp.task('watch', ['scripts', 'styles', 'images', 'extras'], function() {
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.images, ['images']);
	gulp.watch(paths.extras, ['extras']);
});

gulp.task('default', ['clean', 'express'], function () {
	gulp.start('serve');
});

gulp.task('deploy', ['clean'], () => {
	$.util.env.production = true;

	gulp.start(['scripts', 'styles', 'images', 'extras']);
});