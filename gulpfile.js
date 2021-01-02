'use strict';

const {src, dest, watch, series, parallel} = require('gulp');
const del = require('del');
// const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
// html
const pug = require('gulp-pug');
// style
const stylus = require('gulp-stylus');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
// js
const minify = require('gulp-minify');
// images
const imagemin = require('gulp-imagemin');
// const svgstore = require('gulp-svgstore');
// const imgwebp = require('imagemin-webp');
// server
const bs = require('browser-sync').create();

const devDir = 'src';
const prodDir = 'dist';

function clean() {
  return del(prodDir);
}

function copy() {
  return src([
    `${devDir}/fonts/**/*.{woff,woff2}`,
    `${devDir}/img/**`,
    `${devDir}/css/**/*.css`,
  ], {base: devDir}).pipe(dest(prodDir));
}

function html() {
  return src(`${devDir}/pages/*.pug`).
      pipe(pug()).
      pipe(dest(prodDir));
}

function css() {
  return src(`${devDir}/css/*.styl`).
      pipe(stylus()).
      pipe(dest(`${prodDir}/css`)).
      pipe(rename({suffix: '.min'})).
      pipe(autoprefixer()).
      pipe(cssnano()).
      pipe(csso()).
      pipe(dest(`${prodDir}/css`)).pipe(bs.stream());
}

function js() {
  return src(`${devDir}/js/*.js`).
      pipe(minify({ext: {min: '.min.js'}})).
      pipe(dest(`${prodDir}/js`)).pipe(bs.stream());
}

function img() {
  return src(`${devDir}/img/**/*.{png,jpg,jpeg,svg}`).
      pipe(imagemin([
        imagemin.mozjpeg({quality: 80, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo(),
      ])).
      pipe(dest(`${prodDir}/img`)).pipe(bs.stream());
}

function browserSync(done) {
  bs.init({server: `${prodDir}/`, port: 3000});
  done();
}

function browserSyncReload(done) {
  bs.reload();
  done();
}

function watchFiles() {
  watch(`${devDir}/pages/**/*.pug`, series(html, browserSyncReload));
  watch(`${devDir}/css/**/*.styl`, css);
  watch(`${devDir}/js/**/*.js`, js);
}

// Complex tasks
const build = series(clean, copy, parallel(html, css, js, img));
const dev = series(build, parallel(watchFiles, browserSync));

// Exports
exports.clean = clean;
exports.copy = copy;
exports.css = css;
exports.html = html;
exports.js = js;
exports.img = img;
exports.build = build;
exports.dev = dev;
