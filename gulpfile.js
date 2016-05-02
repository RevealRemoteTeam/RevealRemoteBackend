var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', ['minify']);

gulp.task('minify', function (done) {
  var minifyLibs = gulp.src(['www/revealremote_client.js', 'www/lib/qrcode.js/qrcode.js', 'www/lib/node-uuid/uuid.js'], { base: './' })
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./'))
    .on('end', done);

  var minifySocketIo = gulp.src('node_modules/socket.io-client/socket.io.js')
  	.pipe(uglify())
  	.pipe(rename({ extname: '.min.js' }))
  	.pipe(gulp.dest('www/lib'));

  	return [minifyLibs, minifySocketIo];
});