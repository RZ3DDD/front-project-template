/*jshint esversion: 6 */

// Подключаем необходимые модули
const {
    series,
    parallel,
    src,
    dest,
    watch
} = require('gulp');

const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const babel = require("gulp-babel");
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');


// Private task подготовки CSS-определений к развёртыванию 
// jsFiles привязка указывающая на порядок обработки файлов scss, sass и css
const sassFiles = [
    "./src/sass/main.scss",
    // "./src/sass/**/*.scss",
    "./src/sass/**/*.sass"
];
const cssFiles = [
    "./src/css/main.css",
    // "./src/css/sass-to.css",
    "./src/css/**/*.css"
];

function styles() {
    return src(sassFiles, cssFiles)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(concat("styles.css"))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest("./build/css"))
        .pipe(browserSync.stream()); // auto-inject into browsers
}

// jsFiles привязка указывающая на порядок объединения файлов js
const jsFiles = [
    "./src/libsJS/**/*.min.js",
    "./src/js/lib.js",
    "./src/js/main.js",
    "./src/js/**/*.js"
];
// Private task подготовки JS-скриптов к развёртыванию 
function scripts() {
    return src(jsFiles)
        .pipe(concat("scripts.js"))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('maps'))
        .pipe(dest("./build/js"))
        .pipe(browserSync.stream()); // auto-inject into browsers
}

// Private task сжатия изображений
function imgCompress() {
    return src('./src/img/**')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(dest('./build/img/'));
}

// Private task очистки папки build
function clean() {
    return del(['./build/**/*']);
}

// Private task наблюдения за изменеями в файлах
function overwatch() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    watch('./src/img/**', imgCompress); // Следить за изображениями
    watch('./src/css/**/*.css', styles); // Следить за CSS файлами
    watch('./src/sass/**/*.scss', styles); // Следить за CSS файлами
    watch('./src/sass/**/*.sass', styles); // Следить за CSS файлами
    watch('./src/js/**/*.js', scripts); // Следить за JS файлами
    watch('./*.html').on('change', browserSync.reload); // Следить за изменением HTML файлов
}

// Public tasks
// exports.styles = styles;
// exports.scripts = scripts;
// exports.clean = clean;
// exports.overwatch = overwatch;
build = series(clean, parallel(styles, scripts, imgCompress));
exports.default = series(build, overwatch);