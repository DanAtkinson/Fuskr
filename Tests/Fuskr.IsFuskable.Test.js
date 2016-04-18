QUnit.module("IsFuskable", function(){
	
	QUnit.test("Function exists", function(assert){
		assert.equal(!!Fuskr.IsFuskable, true);
		assert.equal(typeof(Fuskr.IsFuskable), "function");
	});

	QUnit.test("Null url", function (assert){
		var url;
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	QUnit.test("Empty string Url", function (assert){
		var url = "";
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	QUnit.test("Object / Invalid parameter Url", function (assert){
		var url = { "hey" : "ho" } ;
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	QUnit.test("Array / Invalid parameter Url", function (assert){
		var url = ["string",1234, {"obj" : "ject"}] ;
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	QUnit.test("URL - Unfuskable - no numbers", function (assert){
		var url = "http://domain.com/path/file/";
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	//URL - Unfuskable (unclosed)
	QUnit.test("URL - Unfuskable (unclosed)", function (assert){
		var url = "http://domain.com/path/file/[0-9.jpg";
		assert.equal(Fuskr.IsFuskable(url), false);

		var url = "http://domain.com/path/file/[a-z.jpg";
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	//URL - Unfuskable (unopen)
	QUnit.test("URL - Unfuskable (unopen)", function (assert){
		var url = "http://domain.com/path/file/0-9].jpg";
		assert.equal(Fuskr.IsFuskable(url), false);

		var url = "http://domain.com/path/file/a-z].jpg";
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	//URL - Unfuskable (symbols)
	QUnit.test("URL - Unfuskable (symbols)", function (assert){
		var url = "http://domain.com/path/file/[0-$&].jpg";
		assert.equal(Fuskr.IsFuskable(url), false);

		var url = "http://domain.com/path/file/[a-$&].jpg";
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	//URL - Unfuskable (malformed)
	QUnit.test("URL - Unfuskable (malformed)", function (assert){
		var url = "http://domain.com/path/file/[0-45[.jpg";
		assert.equal(Fuskr.IsFuskable(url), false);

		var url = "http://domain.com/path/file/[a-z[.jpg";
		assert.equal(Fuskr.IsFuskable(url), false);
	});

	QUnit.test("URL - Fuskable file [0-9]/[a-z]", function (assert){
		var url = "http://domain.com/path/file/[0-9].jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path/file/[a-z].jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with file [0-9]/[a-z]", function (assert){
		var url = "http://domain.com/path[0-9]/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with no file [0-9]/[a-z]", function (assert){
		var url = "http://domain.com/path[0-9]/";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]/";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with no file [0-9]/[a-z] and no trailing slash", function (assert){
		var url = "http://domain.com/path[0-9]";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable domain with file [0-9]/[a-z]", function (assert){
		var url = "http://domain[0-9].com/path/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain[a-z].com/path/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable domain with path only [0-9]/[a-z]", function (assert){
		var url = "http://domain[0-9].com/path";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain[a-z].com/path";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	/*********************************/
	QUnit.test("URL - Fuskable file - [0-9]/[a-z] (multiple fusks)", function (assert){
		var url = "http://domain.com/path/file[0-9]another[0-9].jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path/file[a-z]another[a-z].jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with file [0-9]/[a-z] (multiple fusks)", function (assert){
		var url = "http://domain.com/path[0-9]another[0-9]/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]another[a-z]/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with no file [0-9]/[a-z] (multiple fusks)", function (assert){
		var url = "http://domain.com/path[0-9]another[0-9]/";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]another[a-z]/";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with no file [0-9]/[a-z] and no trailing slash (multiple fusks)", function (assert){
		var url = "http://domain.com/path[0-9]another[0-9]";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]another[a-z]";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable domain with file [0-9]/[a-z] (multiple fusks)", function (assert){
		var url = "http://domain[0-9]another[0-9].com/path/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain[a-z]another[a-z].com/path/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable domain with path only [0-9]/[a-z] (multiple fusks)", function (assert){
		var url = "http://domain[0-9]another[0-9].com/path";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain[a-z]another[a-z].com/path";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	/*********************************/

	QUnit.test("URL - Fuskable file - [0-9]/[a-z] (dual fusks after)", function (assert){
		var url = "http://domain.com/path/file[0-9]another{0}.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path/file[a-z]another{0}.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with file [0-9]/[a-z] (dual fusks after)", function (assert){
		var url = "http://domain.com/path[0-9]another{0}/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]another{0}/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with no file [0-9/[a-z]] (dual fusks after)", function (assert){
		var url = "http://domain.com/path[0-9]another{0}";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]another{0}";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with no file [0-9]/[a-z] and no trailing slash (dual fusks after)", function (assert){
		var url = "http://domain.com/path[0-9]another{0}";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path[a-z]another{0}";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable domain with file [0-9]/[a-z] (dual fusks after)", function (assert){
		var url = "http://domain[0-9]another{0}.com/path/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain[a-z]another{0}.com/path/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable domain with path only [0-9]/[a-z] (dual fusks after)", function (assert){
		var url = "http://domain[0-9]another{0}.com/path";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain[a-z]another{0}.com/path";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable file {0} (dual fusks before)", function (assert){
		var url = "http://domain.com/path/file/{0}another[0-9].jpg";
		assert.equal(true, Fuskr.IsFuskable(url));

		var url = "http://domain.com/path/file/{0}another[a-z].jpg";
		assert.equal(true, Fuskr.IsFuskable(url));
	});

	QUnit.test("URL - Fuskable path with file {0} (dual fusk before)", function (assert){
		var url = "http://domain.com/path{0}another[0-9]/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path{0}another[a-z]/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with no file {0} (dual fusk before)", function (assert){
		var url = "http://domain.com/path{0}another[0-9]/";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path{0}another[a-z]/";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable path with no file {0} and no trailing slash (dual fusk before)", function (assert){
		var url = "http://domain.com/path{4}another[0-9]";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain.com/path{4}another[a-z]";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable domain with file {0} (dual fusk before)", function (assert){
		var url = "http://domain{1}another[0-9].com/path/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain{1}another[a-z].com/path/file.jpg";
		assert.equal(Fuskr.IsFuskable(url), true);
	});

	QUnit.test("URL - Fuskable domain with path only {0} (dual fusk before)", function (assert){
		var url = "http://domain{2}another[0-9].com/path";
		assert.equal(Fuskr.IsFuskable(url), true);

		var url = "http://domain{2}another[a-z].com/path";
		assert.equal(Fuskr.IsFuskable(url), true);
	});
});