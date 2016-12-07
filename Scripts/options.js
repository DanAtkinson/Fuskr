/*global angular,chrome*/
/*jshint latedef:nofunc */
(function () {
	"use strict";

	var app = angular.module('fuskrApp');

	app.config(function ($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/foreground');

		$stateProvider.state('OptionsForeground', {
			url: "/foreground",
			templateUrl: "/Html/partials/options-foreground.html",
			controller: "OptionsController",
			onEnter: function ($rootScope, helpers, $stateParams) {
				$rootScope.pageTitle = "Options - Foreground";
			}
		}).state('OptionsHistory', {
			url: "/history",
			templateUrl: "/Html/partials/options-history.html",
			controller: "OptionsController",
			onEnter: function ($rootScope, helpers, $stateParams) {
				$rootScope.pageTitle = "Options - History";
			}
		}).state('OptionsVersionHistory', {
			url: "/version-history",
			templateUrl: "/Html/partials/options-versionhistory.html",
			controller: "OptionsController",
			onEnter: function ($rootScope, helpers, $stateParams) {
				$rootScope.pageTitle = "Version History";
			}
		}).state('OptionsAbout', {
			url: "/about",
			templateUrl: "/Html/partials/options-about.html",
			controller: "OptionsController",
			onEnter: function ($rootScope, helpers, $stateParams) {
				$rootScope.pageTitle = "About";
			}
		});
	});

	app.controller('OptionsController', function ($document, $rootScope, $scope, helpers) {
		$scope.myValue = helpers.getStorage('myValue', "abc");

		$scope.history = helpers.getStorage('history', "").split('||');
		$scope.keepRecentFusks = helpers.getStorage('keepRecentFusks', 1) === "1";
		$scope.openInForeground = helpers.getStorage('openInForeground', 1) === "1";
		$scope.openFusk = function (url) {
			chrome.tabs.create({
				url: "/Html/images.htm#/fusk/" + url,
				selected: $scope.openInForeground
			});
		};
		$scope.saveToStorage = function (name, value) {
		// TODO: Replace this with a directive to auto-save to storage
			if (typeof value === "boolean") {
				value = value ? 1 : 0;
			}
			helpers.setStorage(name, value);
		};
	});
}());