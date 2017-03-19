const gulp         = require('gulp');
const uglify       = require('gulp-uglify');
const less         = require('gulp-less');
const minifyCSS    = require('gulp-minify-css');
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps   = require('gulp-sourcemaps');
const babel        = require('gulp-babel');

gulp.task('javascripts-copy', () =>
    gulp.src([
        './bower_components/jquery/dist/jquery.js',
        './bower_components/bootstrap/dist/js/bootstrap.js',
        './bower_components/react/react.js',
        './bower_components/SoundManager2/script/soundmanager2.js',
        './bower_components/SoundManager2/swf/soundmanager2.swf',
        './bower_components/SoundManager2/swf/soundmanager2_debug.swf'
    ])
        .pipe(gulp.dest('./public/javascripts/lib/'))
);

gulp.task('css-copy', () =>
    gulp.src([
        './bower_components/bootstrap/dist/css/bootstrap.css',
        './bower_components/bootstrap/dist/css/bootstrap.css.map',
        './bower_components/font-awesome/css/font-awesome.css'
    ])
        .pipe(gulp.dest('./public/stylesheets/'))
);

gulp.task('fonts-copy', () =>
    gulp.src([
        './bower_components/font-awesome/fonts/fontawesome-webfont.eot',
        './bower_components/font-awesome/fonts/fontawesome-webfont.svg',
        './bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
        './bower_components/font-awesome/fonts/fontawesome-webfont.woff',
        './bower_components/font-awesome/fonts/FontAwesome.otf'
    ])
        .pipe(gulp.dest('./public/fonts/'))
);

gulp.task('bower-copy', ['javascripts-copy', 'css-copy', 'fonts-copy']);

gulp.task('less-compile', () =>
    gulp.src('./public/stylesheets/**/*.less', {base: './public'})
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postcss([autoprefixer()]))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/'))
);

gulp.task('build', () =>
    gulp.src([
        './public/javascripts/game.jsx',
    ])
        .pipe(babel({
            presets: ['react']
        }))
        .pipe(gulp.dest('./public/javascripts'))
);

gulp.task('default', ['bower-copy', 'less-compile', 'build']);
