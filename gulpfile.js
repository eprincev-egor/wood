"use strict";

const gulp = require("gulp");

//const deleteFiles = require("gulp-rimraf");
const minifyJS = require("gulp-terser");
const concat = require("gulp-concat");
const zip = require("gulp-zip");
const checkFileSize = require("gulp-check-filesize");
const header = require("gulp-header");
const footer = require("gulp-footer");
const gulpSequence = require("gulp-sequence");
const webpackStream = require("webpack-stream");
// const path = require("path");

const paths = {
    js: "src/*.js",
    distDir: "dist"
};

gulp.task("bundle", () => {
    return gulp.src(paths.js)
        .pipe(webpackStream({
            output: {
                filename: "bundle.js"
            }
        }))
        .pipe(gulp.dest("bundle"));
});

gulp.task("buildHTML", () => {
    return gulp.src("bundle/bundle.js")
        .pipe(concat("index.html"))
        .pipe(minifyJS())
        .pipe(header("<html><head><meta charset=\"UTF-8\"></head><body><script>"))
        .pipe(footer("</script></body></html>"))
        .pipe(gulp.dest(paths.distDir));
});

gulp.task("zip", () => {
    const thirteenKb = 13 * 1024;

    return gulp.src(`${paths.distDir}/**`)
        .pipe(zip("game.zip"))
        .pipe(gulp.dest("zip"))
        .pipe(checkFileSize({ fileSizeLimit: thirteenKb }));
});

let buildCommands = [
    "bundle",
    "buildHTML",
    "zip"
];
gulp.task("build", 
    gulpSequence(...buildCommands)
);

gulp.task("watch", () => {
    gulp.watch(paths.js, () => {
        gulpSequence(
            ...buildCommands
        )();
    });
});

gulp.task("default", gulpSequence(
    "build",
    "watch"
));