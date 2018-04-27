
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var webserver = require('gulp-webserver');
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var cleanCSS = require('gulp-clean-css');

gulp.task('default', ['copy-html', 'styles', 'copy-images', 'copy-manifest', 'css', 'copy-scripts'], function() {
    gulp.watch('js/**/*.js');
    gulp.watch('/*.html', ['copy-html']);
    gulp.watch('./dist/*.html').on('change', browserSync.reload);

    browserSync.init({
        server: './dist'
    });
});

gulp.task('dist', [
    'copy-html',
    'images-process',
    'copy-manifest',
    'scripts-dist',
    'styles',
]);

gulp.task('styles', function () {
    gulp.src(['css/**/*'])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copy-scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(gulp.dest('dist/js'));
    gulp.src('sw.js')
        .pipe(gulp.dest('dist/'));
});

gulp.task('scripts-dist', function() {
    gulp.src('js/**/*.js')
        .pipe(babel({
            presets: [
                ['env', {
                    targets: {
                        browsers: ['last 2 versions']
                    }
                }]
            ]
        }))

        .on('error', function(err) {
            console.log('[ERROR] '+ err.toString() );
        })
        .pipe(gulp.dest('dist/js'));
    gulp.src('sw.js')
        .pipe(babel({
            presets: [
                ['env', {
                    targets: {
                        browsers: ['last 2 versions']
                    }
                }]
            ]
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});

gulp.task('copy-html', function() {
    gulp.src('./*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
    gulp.src('img/*')
        .pipe(gulp.dest('dist/img'));
});

gulp.task('copy-manifest', function() {
    gulp.src('./manifest.json')
        .pipe(gulp.dest('./dist'));
});

gulp.task('images-process', function() {
    return gulp.src('img/*')
        .pipe(imagemin({
            progressive: true,
            use: [imageminPngquant()],
            speed: 5
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('test', ['dist']);

gulp.task('webserver', function() {
    gulp.src('dist')
        .pipe(webserver({
            host: 'localhost',
            port: 8030,
            livereload: true,
            open: true,
        }));
});
