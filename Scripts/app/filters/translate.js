/*global app, angular,chrome */
(function () {
	"use strict";

	var app = angular.module('fuskrApp');

	app.filter('translate', function () {
		return function (name, base) {
			base = typeof base === "undefined" ? "Images_" : (base === "" ? "" : base + "_");
			return (chrome && chrome.i18n && chrome.i18n.getMessage(base + name)) || (base + name);
		};
	});
}());