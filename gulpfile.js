const {src, dest, series, watch} = require('gulp');
const sync = require('browser-sync').create();
const concat = require('gulp-concat');
const del = require('del');

const ghPages = require('gulp-gh-pages');


function html() {
    return src('src/**.html')
    .pipe(dest('dist'))
};

function css() {
    return src('src/css/**.css')
    .pipe(concat('index.css'))
    .pipe(dest('dist/css'))
};

function scripts() {
    return src('src/**.js')
    .pipe(dest('dist/js'))
}

function json() {
    return src('src/db/**.json')
    .pipe(dest('dist/db'))
}

function clear() {
    return del('dist');
}

function serve() {
    sync.init({
        server: { baseDir: './dist'},
    })
    watch('src/**.html', series(html)).on('change', sync.reload);
    watch('src/css/**.css', series(css)).on('change', sync.reload);
    watch('src/**.js', series(scripts)).on('change', sync.reload);
}

function deploy() {
    return gulp.src('./dist/**/*')
    .pipe(ghPages());
}

exports.clear = clear;
exports.deploy = deploy;
exports.build = series(clear, json, html, css, scripts);
exports.serve = series(clear, json, html, css, scripts, serve);

