$(function(){
	module("GetLinks");

	test("Function exists", function(){
		equal(!!Fuskr.GetLinks, true, "GetLinks should exist on the Fuskr object");
		equal(typeof(Fuskr.GetLinks), "function", "GetLinks should be a function");
	});

	test("Null url", function() {
		var url;
		var links = Fuskr.GetLinks(url);
		equal(!!links.push, true, "Result should be an array");
		equal(links.length, 0, "Link array should be empty");
	});
	
	test("Empty string Url", function() {
		var url = "";
		var links = Fuskr.GetLinks(url);
		equal(!!links.push, true, "Result should be an array");
		equal(links.length, 0, "Link array should be empty");
	});
	
	test("Object / Invalid parameter Url", function() {
		var url = { "hey" : "ho" } ;
		var links = Fuskr.GetLinks(url);
		equal(!!links.push, true, "Result should be an array");
		equal(links.length, 0, "Link array should be empty");
	});
	
	test("Array / Invalid parameter Url", function() {
		var url = ["string",1234, {"obj" : "ject"}] ;
		var links = Fuskr.GetLinks(url);
		equal(!!links.push, true, "Result should be an array");
		equal(links.length, 0, "Link array should be empty");
	});
	
	test("URL - Unfuskable", function() {
		var url = "http://domain.com/path/file/";
		var links = Fuskr.GetLinks(url);
		equal(!!links.push, true, "Result should be an array");
		equal(links.length, 0, "Link array should be empty");
	});
	
	test("URL - Fuskable file [0-9]", function() {
		var url = "http://domain.com/path/file/[0-9].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(10, links.length, "Link array length should be 10");
		equal(links[0], "http://domain.com/path/file/0.jpg", "First element wrong");
		equal(links[4], "http://domain.com/path/file/4.jpg", "Fifth element wrong");
		equal(links[7], "http://domain.com/path/file/7.jpg", "Eigth element wrong");
		equal(links[9], "http://domain.com/path/file/9.jpg", "Last element wrong");
	});
	
	test("URL - Fuskable file [8-16]", function() {
		var url = "http://domain.com/path/file/[8-16].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(9, links.length, "Link array length should be 9");
		equal(links[0], "http://domain.com/path/file/8.jpg", "First element wrong");
		equal(links[1], "http://domain.com/path/file/9.jpg", "Second element wrong");
		equal(links[2], "http://domain.com/path/file/10.jpg", "Third element wrong");
		equal(links[3], "http://domain.com/path/file/11.jpg", "Forth element wrong");
		equal(links[8], "http://domain.com/path/file/16.jpg", "Last element wrong");
	});
	
	test("URL - Fuskable file [08-16]", function() {
		var url = "http://domain.com/path/file/[08-16].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(9, links.length, "Link array length should be 9");
		equal(links[0], "http://domain.com/path/file/08.jpg", "First element wrong");
		equal(links[1], "http://domain.com/path/file/09.jpg", "Second element wrong");
		equal(links[2], "http://domain.com/path/file/10.jpg", "Third element wrong");
		equal(links[3], "http://domain.com/path/file/11.jpg", "Forth element wrong");
		equal(links[8], "http://domain.com/path/file/16.jpg", "Last element wrong");
	});
	
	test("URL - Fuskable file [0-9] [3-7]", function() {
		var url = "http://domain.com/path/file/[0-9]and[3-7].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(50, links.length, "Link array length should be 50");
		equal(links[0], "http://domain.com/path/file/0and3.jpg");
		equal(links[1], "http://domain.com/path/file/0and4.jpg");
		equal(links[2], "http://domain.com/path/file/0and5.jpg");
		equal(links[3], "http://domain.com/path/file/0and6.jpg");
		equal(links[4], "http://domain.com/path/file/0and7.jpg");
		equal(links[5], "http://domain.com/path/file/1and3.jpg");
		equal(links[6], "http://domain.com/path/file/1and4.jpg");
		equal(links[7], "http://domain.com/path/file/1and5.jpg");
		equal(links[8], "http://domain.com/path/file/1and6.jpg");
		equal(links[9], "http://domain.com/path/file/1and7.jpg");
		equal(links[49], "http://domain.com/path/file/9and7.jpg");
	});
	
	test("URL - Fuskable file [0-9] [3-7] [10-13]", function() {
		var url = "http://domain.com/path/file/[0-9]and[3-7]and[10-13].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(200, links.length, "Link array length should be 200");
		equal(links[0], "http://domain.com/path/file/0and3and10.jpg");
		equal(links[1], "http://domain.com/path/file/0and3and11.jpg");
		equal(links[2], "http://domain.com/path/file/0and3and12.jpg");
		equal(links[3], "http://domain.com/path/file/0and3and13.jpg");
		equal(links[4], "http://domain.com/path/file/0and4and10.jpg");
		equal(links[5], "http://domain.com/path/file/0and4and11.jpg");
		equal(links[6], "http://domain.com/path/file/0and4and12.jpg");
		equal(links[7], "http://domain.com/path/file/0and4and13.jpg");
		equal(links[8], "http://domain.com/path/file/0and5and10.jpg");
		equal(links[9], "http://domain.com/path/file/0and5and11.jpg");
		equal(links[199], "http://domain.com/path/file/9and7and13.jpg");
	});
	
	test("URL - Fuskable file [0-9] [3-7] [0010-0013]", function() {
		var url = "http://domain.com/path/file/[0-9]and[3-7]and[0010-0013].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(200, links.length, "Link array length should be 200");
		equal(links[0], "http://domain.com/path/file/0and3and0010.jpg");
		equal(links[1], "http://domain.com/path/file/0and3and0011.jpg");
		equal(links[2], "http://domain.com/path/file/0and3and0012.jpg");
		equal(links[3], "http://domain.com/path/file/0and3and0013.jpg");
		equal(links[4], "http://domain.com/path/file/0and4and0010.jpg");
		equal(links[5], "http://domain.com/path/file/0and4and0011.jpg");
		equal(links[6], "http://domain.com/path/file/0and4and0012.jpg");
		equal(links[7], "http://domain.com/path/file/0and4and0013.jpg");
		equal(links[8], "http://domain.com/path/file/0and5and0010.jpg");
		equal(links[9], "http://domain.com/path/file/0and5and0011.jpg");
		equal(links[199], "http://domain.com/path/file/9and7and0013.jpg");
	});
	
	test("URL - Fuskable file [0-9] {0}", function() {
		var url = "http://domain.com/path/file/[0-9]and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(10, links.length, "Link array length should be 10");
		equal(links[0], "http://domain.com/path/file/0and0.jpg", "First element wrong");
		equal(links[4], "http://domain.com/path/file/4and4.jpg", "Fifth element wrong");
		equal(links[7], "http://domain.com/path/file/7and7.jpg", "Eigth element wrong");
		equal(links[9], "http://domain.com/path/file/9and9.jpg", "Last element wrong");
	});
	
	test("URL - Fuskable file [0-9] [3-7] {1}", function() {
		var url = "http://domain.com/path/file/[0-9]and[3-7]and{1}.jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(50, links.length, "Link array length should be 50");
		equal(links[0], "http://domain.com/path/file/0and3and3.jpg");
		equal(links[1], "http://domain.com/path/file/0and4and4.jpg");
		equal(links[2], "http://domain.com/path/file/0and5and5.jpg");
		equal(links[3], "http://domain.com/path/file/0and6and6.jpg");
		equal(links[4], "http://domain.com/path/file/0and7and7.jpg");
		equal(links[5], "http://domain.com/path/file/1and3and3.jpg");
		equal(links[6], "http://domain.com/path/file/1and4and4.jpg");
		equal(links[7], "http://domain.com/path/file/1and5and5.jpg");
		equal(links[8], "http://domain.com/path/file/1and6and6.jpg");
		equal(links[9], "http://domain.com/path/file/1and7and7.jpg");
		equal(links[49], "http://domain.com/path/file/9and7and7.jpg");
	});
	
	test("URL - Fuskable file {1} [0-9] [3-7] {0}", function() {
		var url = "http://domain.com/path/file/{1}and[0-9]then[3-7]and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(50, links.length, "Link array length should be 50");
		equal(links[0], "http://domain.com/path/file/3and0then3and0.jpg");
		equal(links[1], "http://domain.com/path/file/4and0then4and0.jpg");
		equal(links[2], "http://domain.com/path/file/5and0then5and0.jpg");
		equal(links[3], "http://domain.com/path/file/6and0then6and0.jpg");
		equal(links[4], "http://domain.com/path/file/7and0then7and0.jpg");
		equal(links[5], "http://domain.com/path/file/3and1then3and1.jpg");
		equal(links[6], "http://domain.com/path/file/4and1then4and1.jpg");
		equal(links[7], "http://domain.com/path/file/5and1then5and1.jpg");
		equal(links[8], "http://domain.com/path/file/6and1then6and1.jpg");
		equal(links[9], "http://domain.com/path/file/7and1then7and1.jpg");
		equal(links[49], "http://domain.com/path/file/7and9then7and9.jpg");
	});
	
	test("URL - Fuskable file [0-9] {0} {0} {0} {0}", function() {
		var url = "http://domain.com/path/file/[0-9]and{0}and{0}and{0}and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(10, links.length, "Link array length should be 50");
		equal(links[0], "http://domain.com/path/file/0and0and0and0and0.jpg");
		equal(links[1], "http://domain.com/path/file/1and1and1and1and1.jpg");
		equal(links[2], "http://domain.com/path/file/2and2and2and2and2.jpg");
		equal(links[3], "http://domain.com/path/file/3and3and3and3and3.jpg");
		equal(links[4], "http://domain.com/path/file/4and4and4and4and4.jpg");
		equal(links[5], "http://domain.com/path/file/5and5and5and5and5.jpg");
		equal(links[6], "http://domain.com/path/file/6and6and6and6and6.jpg");
		equal(links[7], "http://domain.com/path/file/7and7and7and7and7.jpg");
		equal(links[8], "http://domain.com/path/file/8and8and8and8and8.jpg");
		equal(links[9], "http://domain.com/path/file/9and9and9and9and9.jpg");
	});
});