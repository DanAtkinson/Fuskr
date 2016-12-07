/*global app, angular,chrome,self */
(function () {
	"use strict";

	var app = angular.module('fuskrApp');

	app.service('helpers', function (translateFilter) {
		function setStorage(name, value) {
			chrome.storage.sync.set(name, value);
		}

		function getStorage(name, defaultValue) {
			var value = chrome.storage.sync.get(name);

			if ((typeof value === "undefined" || value === null) && typeof defaultValue !== "undefined") {
				value = defaultValue;
				setStorage(name, value);
			}

			return value;
		}

		function translate(base, text) {
			return translateFilter(base, text);
		}

		function scrollTo(eID) {
			// This scrolling function
			// is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

			var startY, stopY, distance, speed, step, leapY, timer, i;

			startY = (function () {
				// Firefox, Chrome, Opera, Safari
				if (self.pageYOffset) {
					return self.pageYOffset;
				}
				return 0;
			}());
			stopY = (function (eID) {
				var elm, y, node;
				elm = document.getElementById(eID);
				y = elm.offsetTop;
				node = elm;
				while (node.offsetParent && node.offsetParent !== document.body) {
					node = node.offsetParent;
					y += node.offsetTop;
				}
				return y;
			}(eID));

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
					timer = timer + 1;
				}
				return;
			}
			for (i = startY; i > stopY; i -= step) {
				setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
				leapY -= step;
				if (leapY < stopY) {
					leapY = stopY;
				}
				timer = timer + 1;
			}
		}

		this.getStorage = getStorage;
		this.setStorage = setStorage;
		this.translate = translate;
		this.scrollTo = scrollTo;
	});
}());