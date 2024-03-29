var builder = require('node-webkit-builder'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    zip = require('gulp-zip'),
    colors = require('colors'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    uncss = require('gulp-uncss'),
    autoprefixer = require('gulp-autoprefixer')
    minifyCss = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin'),
    fs = require('fs');

gulp.task('copy-fonts', function() {
    gulp.src('app/vendor/fonts/*.*')
        .pipe(gulp.dest('minified/vendor/fonts'));
});

gulp.task('copy-favicon', function() {
    gulp.src('app/favicon.png')
        .pipe(gulp.dest('minified'));
});

gulp.task('copy-package', function() {
    gulp.src('app/package.json')
        .pipe(gulp.dest('minified'));
});

gulp.task('html', function () {
    var assets = useref.assets();

    return gulp.src('app/index.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulpif('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('minified'));
});

gulp.task('copy-favicon-template', function() {
    gulp.src('app/template/favicon.ico')
        .pipe(gulp.dest('minified/template'));
});

gulp.task('html-template', function () {
    var assets = useref.assets();

    return gulp.src('app/template/index.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulpif('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('minified/template'));
});

gulp.task('css-template', ['html-template'], function () {
    return gulp.src('app/template/vendor/css/*.css')
        .pipe(concat('styles.css'))
        .pipe(uncss({
            html: ['app/template/index.html']
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 8', 'ie 9']
        }))
        .pipe(minifyCss())
        .pipe(gulp.dest('minified/template/vendor/css'));
});

gulp.task('minify', ['css-template',  'html', 'copy-fonts', 'copy-favicon', 'copy-favicon-template', 'copy-package']);

gulp.task('install', function () {
    if (!fs.existsSync('./minified/node_modules')) {
        require('child_process').exec('npm install', {cwd: './minified'});
    }
});

gulp.task('nw', ['minify', 'install'], function () {

    var nw = new builder({
        files: ['./minified/**/**', '!./minified/vendor/css/*.css0'],
        platforms: ['osx32', 'osx64', 'linux32', 'linux64']
    });

    nw.on('log', function (msg) {
        gutil.log('\'' + 'node-webkit-builder'.cyan + '\':', msg);
    });

    return nw.build().catch(function (err) {
        gutil.log('\'' + 'node-webkit-builder'.cyan + '\':', err);
    });
});

gulp.task('nw-win', ['minify', 'install'], function () {

    var nw = new builder({
        files: ['./minified/**/**', '!./minified/vendor/css/*.css0'],
        platforms: ['win32'],
        winIco: './favicon.ico'
    });

    nw.on('log', function (msg) {
        gutil.log('\'' + 'node-webkit-builder'.cyan + '\':', msg);
    });

    return nw.build().catch(function (err) {
        gutil.log('\'' + 'node-webkit-builder'.cyan + '\':', err);
    });
});


gulp.task('dist-win', ['nw-win'], function () {
    return gulp.src('build/zikcenter-static/win32/**/**')
        .pipe(zip('Windows.zip'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('dist-osx32', ['nw'], function () {
    return gulp.src('build/zikcenter-static/osx32/**/**')
        .pipe(zip('OSX32.zip'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('dist-osx64', ['nw'], function () {
    return gulp.src('build/zikcenter-static/osx64/**/**')
        .pipe(zip('OSX64.zip'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('dist-linux32', ['nw'], function () {
    return gulp.src('build/zikcenter-static/linux32/**/**')
        .pipe(zip('Linux32.zip'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('dist-linux64', ['nw'], function () {
    return gulp.src('build/zikcenter-static/linux64/**/**')
        .pipe(zip('Linux64.zip'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['dist-osx64', 'dist-osx32', 'dist-linux64', 'dist-linux32']);
