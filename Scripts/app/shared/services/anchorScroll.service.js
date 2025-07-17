/* globals self, document, setTimeout, angular */

(function () {
	'use strict';

	angular
		.module('fuskrApp')
		.factory('anchorScrollService', AnchorScrollService);

	function AnchorScrollService() {
		return {
			scrollTo: scrollTo
		};

		function scrollTo(elementId) {
			// This scrolling function is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
			var i, elm, startY, stopY, distance, speed, step, leapY, timer;

			//Check if the required element actually exists.
			elm = document.getElementById(elementId);
			if (elm === null) {
				return;
			}

			i = 0;
			startY = currentYPosition();
			stopY = elmYPosition(elm);
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
					setTimeout('window.scrollTo(0, ' + leapY + ')', timer * speed);
					leapY += step;
					if (leapY > stopY) {
						leapY = stopY;
					}
					timer++;
				}
				return;
			}

			for (i = startY; i > stopY; i -= step) {
				setTimeout('window.scrollTo(0, ' + leapY + ')', timer * speed);
				leapY -= step;
				if (leapY < stopY) {
					leapY = stopY;
				}
				timer++;
			}

			function currentYPosition() {
				return self.pageYOffset;
			}

			function elmYPosition(elm) {
				var node, y = -1;
				y = elm.offsetTop;
				node = elm;
				while (node.offsetParent && node.offsetParent !== document.body) {
					node = node.offsetParent;
					y += node.offsetTop;
				}
				return y;
			}

		}
	}
}());
