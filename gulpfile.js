//npm i browser-sync gulp gulp-autoprefixer gulp-group-css-media-queries gulp-rigger gulp-sass gulp-clean-css del gulp-rename gulp-imagemin imagemin-jpeg-recompress imagemin-pngquant gulp-webp gulp-webp-html gulp-plumber gulp-uglify
//imagemin-jpegtran imagemin-svgo imagemin-gifsicle imagemin-optipng

"use strict";

//https://learn.javascript.ru/strict-mode

//Указываем Папки Источника, Разработки, Выгрузки
let src_folder = "gulp/src";
let dev_folder = "gulp/dev";
let out_folder = "gulp/out";
//=========================

//Пути для gulp
let path = {

    //пути исходной папки
    src: {
        html: src_folder + "/*.html",
        //scss: src_folder + "/assets/scss/style.scss",
        css: src_folder + "/assets/css/style.css",
        js: src_folder + "/assets/js/script.js",
        img: src_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: src_folder + "/assets/fonts/**/*",
    },

    //пути для анализа изменений
    watch: {
        html: src_folder + "/**/*.html",
        //scss: src_folder + "/assets/scss/**/*.scss",
        css: src_folder + "/assets/css/**/*.css",
        js: src_folder + "/assets/js/script.js",
        img: src_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },

    //Пути для папки разработки
    dev: {
        html: dev_folder + "/",
        css: dev_folder + "/assets/css/",
        js: dev_folder + "/assets/js/",
        img: dev_folder + "/assets/img/",
        fonts: dev_folder + "/assets/fonts/",
    },

    //Пути для папки выгрузки готового проекта
    out: {
        html: out_folder + "/",
        css: out_folder + "/assets/css/",
        js: out_folder + "/assets/js/",
        img: out_folder + "/assets/img/",
        fonts: out_folder + "/assets/fonts/",
    },
    clean_folder: "./" + out_folder + "/",

}
//=====================================

//Список переменных Gulp
let { src, dest }   = require("gulp"),
    gulp_var        = require("gulp"),
    bs_var          = require("browser-sync").create(),
    plumber_var     = require("gulp-plumber"), //Вывод ошибок https://www.npmjs.com/package/gulp-plumber
    rigger_var      = require("gulp-rigger"), //include files "//= path_file"
    del_var         = require("del"), //Удаление
    sass_var        = require("gulp-sass"), //обработка scss и sass
    clean_css_var   = require("gulp-clean-css"), //минимизация файлов в один
    autopref_var    = require("gulp-autoprefixer"), //Добавляет автопрефиксы для старых браузеров
    css_media_var   = require("gulp-group-css-media-queries"), //Собирает в конце файла медиа запросы
    image_var       = require("gulp-imagemin"), //Оптимизация картинок
    newer           = require('gulp-newer')
//Функции
//Функции browser-sync
function bs_fun(done) {
    bs_var.init({
        server: {
            baseDir: "./" + dev_folder + "/"
        },
        port: 3000,
        notify: false
    });
    done();
}

function bs_fun_reload(done) {
    bs_var.reload();
    done();
}

//Функция удаления файлов в каталоге перед Деплоем
function clean_fun() {
    return del_var(path.clean_folder);
}

//Функции HTML
function html_fun() {
    return src(path.src.html)
        .pipe(rigger_var())
        .pipe(plumber_var())
        .pipe(dest(path.dev.html))
        .pipe(bs_var.stream());
}

//Функция преобразования в css
function css_fun() {
    return src(path.src.css)
        .pipe(
            sass_var({
                outputStyle: "expanded"
            })
        )
        .pipe(css_media_var())
        .pipe(autopref_var({
            overrideBrowserslist: ["last 8 versions"],
            cascade: true
        }))
        .pipe(clean_css_var())
        .pipe(plumber_var())
        .pipe(dest(path.dev.css))
        .pipe(bs_var.stream());
}

function img_fun() {
    return src(path.src.img)
        .pipe(plumber_var())
        .pipe(newer('app/images/dest/'))
        .pipe(
            image_var({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 //0 to 7
            })
        )
        .pipe(dest(path.dev.img))
        .pipe(bs_var.stream());
}

//Функция работы с JS
function js_fun() {
    return src(path.src.js)
        .pipe(rigger_var())
        .pipe(plumber_var())
        .pipe(dest(path.dev.js))
        .pipe(bs_var.stream());
}

//Слежение за изменениями
function watchFiles_fun() {
    gulp_var.watch([path.watch.html], html_fun);
    gulp_var.watch([path.watch.css], css_fun);
    gulp_var.watch([path.watch.js], js_fun);
    gulp_var.watch([path.watch.img], img_fun);
}

//Переменные для запуска

let dev_var = gulp_var.series(gulp_var.parallel(js_fun, css_fun, html_fun, img_fun));
let watch_var = gulp_var.parallel(dev_var, watchFiles_fun, bs_fun);
//указать последовательность для Деплоя

//Экспорт функций
exports.img_fun = img_fun;
exports.js_fun = js_fun;
exports.css_fun = css_fun;
exports.html_fun = html_fun;
exports.dev_var = dev_var;
exports.watch_var = watch_var;
exports.default = watch_var;
