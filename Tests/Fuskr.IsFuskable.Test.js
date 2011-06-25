$(document).ready(function(){
	module("IsFuskable");
	
	test("Function exists", function(){
		equals(!!Fuskr.IsFuskable, true);
		equals(typeof(Fuskr.IsFuskable), "function");
	});

	test("Null url", function() {
		var url;
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("Empty string Url", function() {
		var url = "";
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("Object / Invalid parameter Url", function() {
		var url = { "hey" : "ho" } ;
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("Array / Invalid parameter Url", function() {
		var url = ["string",1234, {"obj" : "ject"}] ;
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("URL - Unfuskable - no numbers", function() {
		var url = "http://domain.com/path/file/";
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("URL - Unfuskable (unclosed)", function() {
		var url = "http://domain.com/path/file/[0-9.jpg";
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("URL - Unfuskable (unopen)", function() {
		var url = "http://domain.com/path/file/0-9].jpg";
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("URL - Unfuskable (symbols)", function() {
		var url = "http://domain.com/path/file/[0-$&].jpg";
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("URL - Unfuskable (malformed)", function() {
		var url = "http://domain.com/path/file/[0-45[.jpg";
		equals(Fuskr.IsFuskable(url), false);
	});
	
	test("URL - Fuskable file [0-9]", function() {
		var url = "http://domain.com/path/file/[0-9].jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with file [0-9]", function() {
		var url = "http://domain.com/path[0-9]/file.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with no file [0-9]", function() {
		var url = "http://domain.com/path[0-9]/";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with no file [0-9] and no trailing slash", function() {
		var url = "http://domain.com/path[0-9]";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable domain with file [0-9]", function() {
		var url = "http://domain[0-9].com/path/file.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable domain with path only [0-9]", function() {
		var url = "http://domain[0-9].com/path";
		equals(Fuskr.IsFuskable(url), true);
	});

	/*********************************/
	test("URL - Fuskable file - [0-9] (multiple fusks)", function() {
		var url = "http://domain.com/path/file[0-9]another[0-9].jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with file [0-9] (multiple fusks)", function() {
		var url = "http://domain.com/path[0-9]another[0-9]/file.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with no file [0-9] (multiple fusks)", function() {
		var url = "http://domain.com/path[0-9]another[0-9]/";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with no file [0-9] and no trailing slash (multiple fusks)", function() {
		var url = "http://domain.com/path[0-9]another[0-9]";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable domain with file [0-9] (multiple fusks)", function() {
		var url = "http://domain[0-9]another[0-9].com/path/file.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable domain with path only [0-9] (multiple fusks)", function() {
		var url = "http://domain[0-9]another[0-9].com/path";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	/*********************************/
	test("URL - Fuskable file - [0-9] (dual fusks after)", function() {
		var url = "http://domain.com/path/file[0-9]another{0}.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with file [0-9] (dual fusks after)", function() {
		var url = "http://domain.com/path[0-9]another{0}/file.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with no file [0-9] (dual fusks after)", function() {
		var url = "http://domain.com/path[0-9]another{0}";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with no file [0-9] and no trailing slash (dual fusks after)", function() {
		var url = "http://domain.com/path[0-9]another{0}";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable domain with file [0-9] (dual fusks after)", function() {
		var url = "http://domain[0-9]another{0}.com/path/file.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable domain with path only [0-9] (dual fusks after)", function() {
		var url = "http://domain[0-9]another{0}.com/path";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable file {0} (dual fusks before)", function() {
		var url = "http://domain.com/path/file/{0}another[0-9].jpg";
		equals(true, Fuskr.IsFuskable(url));
	});
	
	test("URL - Fuskable path with file {0} (dual fusk before)", function() {
		var url = "http://domain.com/path{0}another[0-9]/file.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with no file {0} (dual fusk before)", function() {
		var url = "http://domain.com/path{0}another[0-9]/";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable path with no file {0} and no trailing slash (dual fusk before)", function() {
		var url = "http://domain.com/path{4}another[0-9]";
		equals(Fuskr.IsFuskable(url), true);
	});
	
	test("URL - Fuskable domain with file {0} (dual fusk before)", function() {
		var url = "http://domain{1}another[0-9].com/path/file.jpg";
		equals(Fuskr.IsFuskable(url), true);
	});

	test("URL - Fuskable domain with path only {0} (dual fusk before)", function() {
		var url = "http://domain{2}another[0-9].com/path";
		equals(Fuskr.IsFuskable(url), true);
	});
});