/*global app, angular,Fuskr,URL */
(function () {
	"use strict";

	var app = angular.module('fuskrApp');

	app.service('fuskrService', function ($http) {
		this.getLinks = function (url) {
			return Fuskr.GetLinks(url).map(function (url, i) {
				var imageItem =  {
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
}());