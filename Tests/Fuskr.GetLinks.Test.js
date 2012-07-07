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

	test("URL - Fuskable file [a-z]", function() {
		var url = "http://domain.com/path/file/[a-z].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(26, links.length, "Link array length should be 26");
		equal(links[0], "http://domain.com/path/file/a.jpg", "First element wrong");
		equal(links[4], "http://domain.com/path/file/e.jpg", "Fifth element wrong");
		equal(links[12], "http://domain.com/path/file/m.jpg", "Thirteenth element wrong");
		equal(links[25], "http://domain.com/path/file/z.jpg", "Last element wrong");
	});

	test("URL - Fuskable file [8-16]", function() {
		var url = "http://domain.com/path/file/[8-16].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(9, links.length, "Link array length should be 9");
		equal(links[0], "http://domain.com/path/file/8.jpg", "First element wrong");
		equal(links[1], "http://domain.com/path/file/9.jpg", "Second element wrong");
		equal(links[2], "http://domain.com/path/file/10.jpg", "Third element wrong");
		equal(links[3], "http://domain.com/path/file/11.jpg", "Fourth element wrong");
		equal(links[8], "http://domain.com/path/file/16.jpg", "Last element wrong");
	});

	test("URL - Fuskable file [h-p]", function() {
		var url = "http://domain.com/path/file/[h-p].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(9, links.length, "Link array length should be 9");
		equal(links[0], "http://domain.com/path/file/h.jpg", "First element wrong");
		equal(links[1], "http://domain.com/path/file/i.jpg", "Second element wrong");
		equal(links[2], "http://domain.com/path/file/j.jpg", "Third element wrong");
		equal(links[3], "http://domain.com/path/file/k.jpg", "Fourth element wrong");
		equal(links[8], "http://domain.com/path/file/p.jpg", "Last element wrong");
	});

	test("URL - Fuskable file [08-16]", function() {
		var url = "http://domain.com/path/file/[08-16].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(9, links.length, "Link array length should be 9");
		equal(links[0], "http://domain.com/path/file/08.jpg", "First element wrong");
		equal(links[1], "http://domain.com/path/file/09.jpg", "Second element wrong");
		equal(links[2], "http://domain.com/path/file/10.jpg", "Third element wrong");
		equal(links[3], "http://domain.com/path/file/11.jpg", "Fourth element wrong");
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

	test("URL - Fuskable file [a-z] [c-g]", function() {
		var url = "http://domain.com/path/file/[a-z]and[c-g].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(130, links.length, "Link array length should be 130");
		equal(links[0], "http://domain.com/path/file/aandc.jpg");
		equal(links[1], "http://domain.com/path/file/aandd.jpg");
		equal(links[2], "http://domain.com/path/file/aande.jpg");
		equal(links[3], "http://domain.com/path/file/aandf.jpg");
		equal(links[4], "http://domain.com/path/file/aandg.jpg");
		equal(links[5], "http://domain.com/path/file/bandc.jpg");
		equal(links[6], "http://domain.com/path/file/bandd.jpg");
		equal(links[7], "http://domain.com/path/file/bande.jpg");
		equal(links[8], "http://domain.com/path/file/bandf.jpg");
		equal(links[9], "http://domain.com/path/file/bandg.jpg");
		equal(links[49], "http://domain.com/path/file/jandg.jpg");
		equal(links[129], "http://domain.com/path/file/zandg.jpg");
	});

	test("URL - Fuskable file [0-9] [c-g]", function() {
		var url = "http://domain.com/path/file/[0-9]and[c-g].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(50, links.length, "Link array length should be 50");
		equal(links[0], "http://domain.com/path/file/0andc.jpg");
		equal(links[1], "http://domain.com/path/file/0andd.jpg");
		equal(links[2], "http://domain.com/path/file/0ande.jpg");
		equal(links[3], "http://domain.com/path/file/0andf.jpg");
		equal(links[4], "http://domain.com/path/file/0andg.jpg");
		equal(links[5], "http://domain.com/path/file/1andc.jpg");
		equal(links[6], "http://domain.com/path/file/1andd.jpg");
		equal(links[7], "http://domain.com/path/file/1ande.jpg");
		equal(links[8], "http://domain.com/path/file/1andf.jpg");
		equal(links[9], "http://domain.com/path/file/1andg.jpg");
		equal(links[49], "http://domain.com/path/file/9andg.jpg");
		equal(links[49], "http://domain.com/path/file/9andg.jpg");
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

	test("URL - Fuskable file [a-z] [c-g] [j-m]", function() {
		var url = "http://domain.com/path/file/[a-z]and[c-g]and[j-m].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(520, links.length, "Link array length should be 520");
		equal(links[0], "http://domain.com/path/file/aandcandj.jpg");
		equal(links[1], "http://domain.com/path/file/aandcandk.jpg");
		equal(links[2], "http://domain.com/path/file/aandcandl.jpg");
		equal(links[3], "http://domain.com/path/file/aandcandm.jpg");
		equal(links[4], "http://domain.com/path/file/aanddandj.jpg");
		equal(links[5], "http://domain.com/path/file/aanddandk.jpg");
		equal(links[6], "http://domain.com/path/file/aanddandl.jpg");
		equal(links[7], "http://domain.com/path/file/aanddandm.jpg");
		equal(links[8], "http://domain.com/path/file/aandeandj.jpg");
		equal(links[9], "http://domain.com/path/file/aandeandk.jpg");
		equal(links[519], "http://domain.com/path/file/zandgandm.jpg");
	});

	test("URL - Fuskable file [0-9] [c-g] [j-m]", function() {
		var url = "http://domain.com/path/file/[0-9]and[c-g]and[j-m].jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(200, links.length, "Link array length should be 200");
		equal(links[0], "http://domain.com/path/file/0andcandj.jpg");
		equal(links[1], "http://domain.com/path/file/0andcandk.jpg");
		equal(links[2], "http://domain.com/path/file/0andcandl.jpg");
		equal(links[3], "http://domain.com/path/file/0andcandm.jpg");
		equal(links[4], "http://domain.com/path/file/0anddandj.jpg");
		equal(links[5], "http://domain.com/path/file/0anddandk.jpg");
		equal(links[6], "http://domain.com/path/file/0anddandl.jpg");
		equal(links[7], "http://domain.com/path/file/0anddandm.jpg");
		equal(links[8], "http://domain.com/path/file/0andeandj.jpg");
		equal(links[9], "http://domain.com/path/file/0andeandk.jpg");
		equal(links[199], "http://domain.com/path/file/9andgandm.jpg");
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

	test("URL - Fuskable file [a-z] {0}", function() {
		var url = "http://domain.com/path/file/[a-z]and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(26, links.length, "Link array length should be 26");
		equal(links[0], "http://domain.com/path/file/aanda.jpg", "First element wrong");
		equal(links[4], "http://domain.com/path/file/eande.jpg", "Fifth element wrong");
		equal(links[7], "http://domain.com/path/file/handh.jpg", "Eigth element wrong");
		equal(links[25], "http://domain.com/path/file/zandz.jpg", "Last element wrong");
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

	test("URL - Fuskable file [a-z] [c-g] {1}", function() {
		var url = "http://domain.com/path/file/[a-z]and[c-g]and{1}.jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(130, links.length, "Link array length should be 130");
		equal(links[0], "http://domain.com/path/file/aandcandc.jpg");
		equal(links[1], "http://domain.com/path/file/aanddandd.jpg");
		equal(links[2], "http://domain.com/path/file/aandeande.jpg");
		equal(links[3], "http://domain.com/path/file/aandfandf.jpg");
		equal(links[4], "http://domain.com/path/file/aandgandg.jpg");
		equal(links[5], "http://domain.com/path/file/bandcandc.jpg");
		equal(links[6], "http://domain.com/path/file/banddandd.jpg");
		equal(links[7], "http://domain.com/path/file/bandeande.jpg");
		equal(links[8], "http://domain.com/path/file/bandfandf.jpg");
		equal(links[9], "http://domain.com/path/file/bandgandg.jpg");
		equal(links[49], "http://domain.com/path/file/jandgandg.jpg");
		equal(links[129], "http://domain.com/path/file/zandgandg.jpg");
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
		equal(10, links.length, "Link array length should be 10");
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

	test("URL - Fuskable file [a-z] {0} {0} {0} {0}", function() {
		var url = "http://domain.com/path/file/[a-z]and{0}and{0}and{0}and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		equal(true, !!links.push, "Result should be an array");
		equal(26, links.length, "Link array length should be 26");
		equal(links[0], "http://domain.com/path/file/aandaandaandaanda.jpg");
		equal(links[1], "http://domain.com/path/file/bandbandbandbandb.jpg");
		equal(links[2], "http://domain.com/path/file/candcandcandcandc.jpg");
		equal(links[3], "http://domain.com/path/file/danddanddanddandd.jpg");
		equal(links[4], "http://domain.com/path/file/eandeandeandeande.jpg");
		equal(links[5], "http://domain.com/path/file/fandfandfandfandf.jpg");
		equal(links[6], "http://domain.com/path/file/gandgandgandgandg.jpg");
		equal(links[7], "http://domain.com/path/file/handhandhandhandh.jpg");
		equal(links[8], "http://domain.com/path/file/iandiandiandiandi.jpg");
		equal(links[25], "http://domain.com/path/file/zandzandzandzandz.jpg");
	});
});