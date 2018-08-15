"use strict";

const gulp = require("gulp");

const deleteFiles = require("gulp-rimraf");
const minifyJS = require("gulp-terser");
const concat = require("gulp-concat");
const zip = require("gulp-zip");
const checkFileSize = require("gulp-check-filesize");
const header = require("gulp-header");
const footer = require("gulp-footer");

const paths = {
    js: "src/main.js",
    distDir: "dist",
    distHtmlFile: "index.html"
};

gulp.task("cleanDist", () => {
    return gulp.src("dist/*", { read: false })
        .pipe(deleteFiles());
});

gulp.task("buildHTML", () => {
    return gulp.src(paths.js)
        .pipe(concat(paths.distHtmlFile))
        .pipe(minifyJS())
        .pipe(header("<script>"))
        .pipe(footer("</script>"))
        .pipe(gulp.dest(paths.distDir));
});

gulp.task("zip", () => {
    const thirteenKb = 13 * 1024;

    gulp.src("zip/*")
        .pipe(deleteFiles());

    return gulp.src(`${paths.distDir}/**`)
        .pipe(zip("game.zip"))
        .pipe(gulp.dest("zip"))
        .pipe(checkFileSize({ fileSizeLimit: thirteenKb }));
});

gulp.task("build", [
    "cleanDist",
    "buildHTML",
    "zip"    
]);

gulp.task("watch", () => {
    gulp.watch(paths.js, [
        "buildHTML", 
        "zip"
    ]);
});

gulp.task("default", [
    "build",
    "watch"
]);