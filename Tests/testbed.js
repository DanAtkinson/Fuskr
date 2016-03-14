;(function() {

	var app = angular.module('fuskrApp');

	app.controller('TestBedController', function($scope, fuskrService) {
		$scope.url = "http://example.com/[1-10]-file.jpg";
		$scope.getLinks = getLinks;

		function getLinks() {
			return fuskrService.getLinks($scope.url || "")
					.map(i => i.url)
					.join("\n");
		}
	});
}());