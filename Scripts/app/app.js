/* jshint undef: false */
/*globals angular, chrome, Fuskr, URL, pageYOffset */
(function () {
    "use strict";

    var app = angular.module('fuskrApp', ['ui.router', 'pathgather.popeye']);

    app.filter('translate', function () {
        return function (name, base) {
            base = typeof base === "undefined" ? "Images_" : (base === "" ? "" : base + "_");
            return chrome && chrome.i18n && (chrome.i18n.getMessage(base + name) || (base + name));
        };
    });

    app.filter('translateHtml', function ($sce) {
        return function (name, base) {
            base = typeof base === "undefined" ? "Images_" : (base === "" ? "" : base + "_");
            var translation = chrome && chrome.i18n && (chrome.i18n.getMessage(base + name) || (base + name));
            return $sce.trustAsHtml(translation);
        };
    });

    app.service('fuskrService', function ($http) {
        this.getLinks = function (url) {
            return Fuskr.GetLinks(url).map(function (url, i) {
                var imageItem = {
                    url: url,
                    loaded: false,
                    success: false,
                    active: (i === 0),
                    src: null
                };

                $http({
                    url: imageItem.url,
                    responseType: 'blob',
                    method: 'GET'
                }).then(function (response) {
                    imageItem.success = (response.status >= 200 && response.status < 400);
                    imageItem.loaded = true;
                    imageItem.src = (response.data) ? URL.createObjectURL(response.data) : null;
                    imageItem.data = response.data;
                }, function () {
                    imageItem.success = false;
                    imageItem.loaded = true;
                });

                return imageItem;
            });
        };
    });

    app.service('helpers', function (translateFilter) {

        this.getStorage = function (name, defaultValue) {
            var value = localStorage.getItem(name);

            if ((typeof value === "undefined" || value === null) && typeof defaultValue !== "undefined") {
                value = defaultValue;
                this.setStorage(name, value);
            }

            return value;
        };

        this.setStorage = function (name, value) {
            localStorage.setItem(name, value);
        };

        this.translate = function (base, text) {
            return translateFilter(base, text);
        };

        this.scrollTo = function (eID) {

            function elmYPosition(eID) {
                var y, elm, node;

                elm = document.getElementById(eID);
                y = elm.offsetTop;
                node = elm;
                while (node.offsetParent && node.offsetParent !== document.body) {
                    node = node.offsetParent;
                    y += node.offsetTop;
                }
                return y;
            }

            // This scrolling function
            // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

            var i,
                step,
                timer,
                speed,
                leapY,
                startY = pageYOffset,
                stopY = elmYPosition(eID),
                distance = stopY > startY ? stopY - startY : startY - stopY;

            if (distance < 100) {
                scrollTo(0, stopY);
                return;
            }

            speed = Math.round(distance / 100);
            if (speed >= 20) {
                speed = 20;
            }

            step = Math.round(distance / 25);
            leapY = stopY > startY ? startY + step : startY - step;
            timer = 0;

            if (stopY > startY) {
                for (i = startY; i < stopY; i += step) {
                    setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
                    leapY += step;
                    if (leapY > stopY) {
                        leapY = stopY;
                    }

                    timer += 1;
                }
                return;
            }
            for (i = startY; i > stopY; i -= step) {
                setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
                leapY -= step;
                if (leapY < stopY) {
                    leapY = stopY;
                }

                timer += 1;
            }

        };

    });

    app.run(function ($rootScope, helpers) {
        $rootScope.manifestName = helpers.translate("ManifestName", "");
        $rootScope.manifestLanguage = helpers.translate("ManifestLanguage", "");
    });
}());
