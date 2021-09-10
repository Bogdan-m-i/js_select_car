const gulp = require('gulp'),
    browserSync = require("browser-sync").create(),
    scss = require('gulp-sass'),
    cleanCss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fs = require('fs'),
    imagemin = require('gulp-imagemin'),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    uglify = require('gulp-uglify-es').default,
    notify = require('gulp-notify'),
    ftp = require('vinyl-ftp'); // FTP НЕ ТЕСТИЛ

function resources() {
  return gulp.src('./src/resources/**/*')
		.pipe(gulp.dest('./dist/resources'))
}

function js() {
  return gulp.src('./src/js/*.js')
    .pipe(webpackStream({
      mode: 'development',
      entry: {
        main: './src/js/main.js',
        //adm: './src/js/Adm.js',
      },
      output: {
        filename: '[name].js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                ["@babel/plugin-transform-runtime"]
              ]
            },
            
          }
        }]
      },
    }))
    
    // .pipe(sourcemaps.init())
    // .pipe(uglify().on("error", notify.onError()))
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream());
}

function img() {
  return gulp.src('./src/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/img'))
        .pipe(browserSync.stream())
}

function css() {''
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(scss({ outputStyle: 'expanded' }).on('error', notify.onError()))
    .pipe(autoprefixer())
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
}

function html() {
  return gulp.src(['./src/index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream())
}

function watch() {
  browserSync.init({
    server: {
        baseDir: "./dist"
    }
  });
  gulp.watch('./src/scss/**/*.scss', css)
  gulp.watch('./src/**.html', html)
  gulp.watch('./src/img/**/*', img)
  gulp.watch('./src/js/**/*.js', js),
  gulp.watch('./src/resources/**/*', resources);
}

function clean() {
  return del(['dist/*'])
}

function deploy() {
  let conn = ftp.create({
    host: '',
    user: '',
    password: '',
    parallel: 10,
    //log: gutil.log
  });

  let globs = [
    'dist/**',
  ];

  return gulp.src(globs, {
      base: './dist',
      buffer: false
    })
    .pipe(conn.newer('')) // only upload newer files
    .pipe(conn.dest(''))
}

exports.css = css;
exports.deploy = deploy;
exports.watch = watch;
exports.default = gulp.series(clean, gulp.parallel(html, js, img, resources), css, watch);