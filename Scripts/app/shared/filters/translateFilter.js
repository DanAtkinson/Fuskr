/* globals angular */

(function () {
	'use strict';

	angular
		.module('fuskrApp')
		.filter('translate', translateFilter);

	translateFilter.$inject = ['chromeService'];

	function translateFilter(chromeService) {
		return function (name, base) {
			base = typeof (base) === 'undefined' ? 'Images_' : (base === '' ? '' : base + '_');
			return chromeService.getMessage(base + name);
		};
	}

}());
