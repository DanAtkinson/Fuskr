QUnit.module("GetLinks", function(){

	QUnit.test("Function exists", function (assert) {
		assert.equal(!!Fuskr.GetLinks, true, "GetLinks should exist on the Fuskr object");
		assert.equal(typeof(Fuskr.GetLinks), "function", "GetLinks should be a function");
	});

	QUnit.test("Null url", function (assert) {
		var url;
		var links = Fuskr.GetLinks(url);
		assert.equal(!!links.push, true, "Result should be an array");
		assert.equal(links.length, 0, "Link array should be empty");
	});

	QUnit.test("Empty string Url", function (assert) {
		var url = "";
		var links = Fuskr.GetLinks(url);
		assert.equal(!!links.push, true, "Result should be an array");
		assert.equal(links.length, 0, "Link array should be empty");
	});

	QUnit.test("Object / Invalid parameter Url", function (assert) {
		var url = { "hey" : "ho" } ;
		var links = Fuskr.GetLinks(url);
		assert.equal(!!links.push, true, "Result should be an array");
		assert.equal(links.length, 0, "Link array should be empty");
	});

	QUnit.test("Array / Invalid parameter Url", function (assert) {
		var url = ["string",1234, {"obj" : "ject"}] ;
		var links = Fuskr.GetLinks(url);
		assert.equal(!!links.push, true, "Result should be an array");
		assert.equal(links.length, 0, "Link array should be empty");
	});

	QUnit.test("URL - Unfuskable", function (assert) {
		var url = "http://domain.com/path/file/";
		var links = Fuskr.GetLinks(url);
		assert.equal(!!links.push, true, "Result should be an array");
		assert.equal(links.length, 0, "Link array should be empty");
	});

	QUnit.test("URL - Fuskable file [0-9]", function (assert) {
		var url = "http://domain.com/path/file/[0-9].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(10, links.length, "Link array length should be 10");
		assert.equal(links[0], "http://domain.com/path/file/0.jpg", "First element wrong");
		assert.equal(links[4], "http://domain.com/path/file/4.jpg", "Fifth element wrong");
		assert.equal(links[7], "http://domain.com/path/file/7.jpg", "Eigth element wrong");
		assert.equal(links[9], "http://domain.com/path/file/9.jpg", "Last element wrong");
	});

	QUnit.test("URL - Fuskable file [a-z]", function (assert) {
		var url = "http://domain.com/path/file/[a-z].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(26, links.length, "Link array length should be 26");
		assert.equal(links[0], "http://domain.com/path/file/a.jpg", "First element wrong");
		assert.equal(links[4], "http://domain.com/path/file/e.jpg", "Fifth element wrong");
		assert.equal(links[12], "http://domain.com/path/file/m.jpg", "Thirteenth element wrong");
		assert.equal(links[25], "http://domain.com/path/file/z.jpg", "Last element wrong");
	});

	QUnit.test("URL - Fuskable file [8-16]", function (assert) {
		var url = "http://domain.com/path/file/[8-16].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(9, links.length, "Link array length should be 9");
		assert.equal(links[0], "http://domain.com/path/file/8.jpg", "First element wrong");
		assert.equal(links[1], "http://domain.com/path/file/9.jpg", "Second element wrong");
		assert.equal(links[2], "http://domain.com/path/file/10.jpg", "Third element wrong");
		assert.equal(links[3], "http://domain.com/path/file/11.jpg", "Fourth element wrong");
		assert.equal(links[8], "http://domain.com/path/file/16.jpg", "Last element wrong");
	});

	QUnit.test("URL - Fuskable file [h-p]", function (assert) {
		var url = "http://domain.com/path/file/[h-p].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(9, links.length, "Link array length should be 9");
		assert.equal(links[0], "http://domain.com/path/file/h.jpg", "First element wrong");
		assert.equal(links[1], "http://domain.com/path/file/i.jpg", "Second element wrong");
		assert.equal(links[2], "http://domain.com/path/file/j.jpg", "Third element wrong");
		assert.equal(links[3], "http://domain.com/path/file/k.jpg", "Fourth element wrong");
		assert.equal(links[8], "http://domain.com/path/file/p.jpg", "Last element wrong");
	});

	QUnit.test("URL - Fuskable file [08-16]", function (assert) {
		var url = "http://domain.com/path/file/[08-16].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(9, links.length, "Link array length should be 9");
		assert.equal(links[0], "http://domain.com/path/file/08.jpg", "First element wrong");
		assert.equal(links[1], "http://domain.com/path/file/09.jpg", "Second element wrong");
		assert.equal(links[2], "http://domain.com/path/file/10.jpg", "Third element wrong");
		assert.equal(links[3], "http://domain.com/path/file/11.jpg", "Fourth element wrong");
		assert.equal(links[8], "http://domain.com/path/file/16.jpg", "Last element wrong");
	});

	QUnit.test("URL - Fuskable file [0-9] [3-7]", function (assert) {
		var url = "http://domain.com/path/file/[0-9]and[3-7].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(50, links.length, "Link array length should be 50");
		assert.equal(links[0], "http://domain.com/path/file/0and3.jpg");
		assert.equal(links[1], "http://domain.com/path/file/0and4.jpg");
		assert.equal(links[2], "http://domain.com/path/file/0and5.jpg");
		assert.equal(links[3], "http://domain.com/path/file/0and6.jpg");
		assert.equal(links[4], "http://domain.com/path/file/0and7.jpg");
		assert.equal(links[5], "http://domain.com/path/file/1and3.jpg");
		assert.equal(links[6], "http://domain.com/path/file/1and4.jpg");
		assert.equal(links[7], "http://domain.com/path/file/1and5.jpg");
		assert.equal(links[8], "http://domain.com/path/file/1and6.jpg");
		assert.equal(links[9], "http://domain.com/path/file/1and7.jpg");
		assert.equal(links[49], "http://domain.com/path/file/9and7.jpg");
	});

	QUnit.test("URL - Fuskable file [a-z] [c-g]", function (assert) {
		var url = "http://domain.com/path/file/[a-z]and[c-g].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(130, links.length, "Link array length should be 130");
		assert.equal(links[0], "http://domain.com/path/file/aandc.jpg");
		assert.equal(links[1], "http://domain.com/path/file/aandd.jpg");
		assert.equal(links[2], "http://domain.com/path/file/aande.jpg");
		assert.equal(links[3], "http://domain.com/path/file/aandf.jpg");
		assert.equal(links[4], "http://domain.com/path/file/aandg.jpg");
		assert.equal(links[5], "http://domain.com/path/file/bandc.jpg");
		assert.equal(links[6], "http://domain.com/path/file/bandd.jpg");
		assert.equal(links[7], "http://domain.com/path/file/bande.jpg");
		assert.equal(links[8], "http://domain.com/path/file/bandf.jpg");
		assert.equal(links[9], "http://domain.com/path/file/bandg.jpg");
		assert.equal(links[49], "http://domain.com/path/file/jandg.jpg");
		assert.equal(links[129], "http://domain.com/path/file/zandg.jpg");
	});

	QUnit.test("URL - Fuskable file [0-9] [c-g]", function (assert) {
		var url = "http://domain.com/path/file/[0-9]and[c-g].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(50, links.length, "Link array length should be 50");
		assert.equal(links[0], "http://domain.com/path/file/0andc.jpg");
		assert.equal(links[1], "http://domain.com/path/file/0andd.jpg");
		assert.equal(links[2], "http://domain.com/path/file/0ande.jpg");
		assert.equal(links[3], "http://domain.com/path/file/0andf.jpg");
		assert.equal(links[4], "http://domain.com/path/file/0andg.jpg");
		assert.equal(links[5], "http://domain.com/path/file/1andc.jpg");
		assert.equal(links[6], "http://domain.com/path/file/1andd.jpg");
		assert.equal(links[7], "http://domain.com/path/file/1ande.jpg");
		assert.equal(links[8], "http://domain.com/path/file/1andf.jpg");
		assert.equal(links[9], "http://domain.com/path/file/1andg.jpg");
		assert.equal(links[49], "http://domain.com/path/file/9andg.jpg");
		assert.equal(links[49], "http://domain.com/path/file/9andg.jpg");
	});

	QUnit.test("URL - Fuskable file [0-9] [3-7] [10-13]", function (assert) {
		var url = "http://domain.com/path/file/[0-9]and[3-7]and[10-13].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(200, links.length, "Link array length should be 200");
		assert.equal(links[0], "http://domain.com/path/file/0and3and10.jpg");
		assert.equal(links[1], "http://domain.com/path/file/0and3and11.jpg");
		assert.equal(links[2], "http://domain.com/path/file/0and3and12.jpg");
		assert.equal(links[3], "http://domain.com/path/file/0and3and13.jpg");
		assert.equal(links[4], "http://domain.com/path/file/0and4and10.jpg");
		assert.equal(links[5], "http://domain.com/path/file/0and4and11.jpg");
		assert.equal(links[6], "http://domain.com/path/file/0and4and12.jpg");
		assert.equal(links[7], "http://domain.com/path/file/0and4and13.jpg");
		assert.equal(links[8], "http://domain.com/path/file/0and5and10.jpg");
		assert.equal(links[9], "http://domain.com/path/file/0and5and11.jpg");
		assert.equal(links[199], "http://domain.com/path/file/9and7and13.jpg");
	});

	QUnit.test("URL - Fuskable file [a-z] [c-g] [j-m]", function (assert) {
		var url = "http://domain.com/path/file/[a-z]and[c-g]and[j-m].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(520, links.length, "Link array length should be 520");
		assert.equal(links[0], "http://domain.com/path/file/aandcandj.jpg");
		assert.equal(links[1], "http://domain.com/path/file/aandcandk.jpg");
		assert.equal(links[2], "http://domain.com/path/file/aandcandl.jpg");
		assert.equal(links[3], "http://domain.com/path/file/aandcandm.jpg");
		assert.equal(links[4], "http://domain.com/path/file/aanddandj.jpg");
		assert.equal(links[5], "http://domain.com/path/file/aanddandk.jpg");
		assert.equal(links[6], "http://domain.com/path/file/aanddandl.jpg");
		assert.equal(links[7], "http://domain.com/path/file/aanddandm.jpg");
		assert.equal(links[8], "http://domain.com/path/file/aandeandj.jpg");
		assert.equal(links[9], "http://domain.com/path/file/aandeandk.jpg");
		assert.equal(links[519], "http://domain.com/path/file/zandgandm.jpg");
	});

	QUnit.test("URL - Fuskable file [0-9] [c-g] [j-m]", function (assert) {
		var url = "http://domain.com/path/file/[0-9]and[c-g]and[j-m].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(200, links.length, "Link array length should be 200");
		assert.equal(links[0], "http://domain.com/path/file/0andcandj.jpg");
		assert.equal(links[1], "http://domain.com/path/file/0andcandk.jpg");
		assert.equal(links[2], "http://domain.com/path/file/0andcandl.jpg");
		assert.equal(links[3], "http://domain.com/path/file/0andcandm.jpg");
		assert.equal(links[4], "http://domain.com/path/file/0anddandj.jpg");
		assert.equal(links[5], "http://domain.com/path/file/0anddandk.jpg");
		assert.equal(links[6], "http://domain.com/path/file/0anddandl.jpg");
		assert.equal(links[7], "http://domain.com/path/file/0anddandm.jpg");
		assert.equal(links[8], "http://domain.com/path/file/0andeandj.jpg");
		assert.equal(links[9], "http://domain.com/path/file/0andeandk.jpg");
		assert.equal(links[199], "http://domain.com/path/file/9andgandm.jpg");
	});

	QUnit.test("URL - Fuskable file [0-9] [3-7] [0010-0013]", function (assert) {
		var url = "http://domain.com/path/file/[0-9]and[3-7]and[0010-0013].jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(200, links.length, "Link array length should be 200");
		assert.equal(links[0], "http://domain.com/path/file/0and3and0010.jpg");
		assert.equal(links[1], "http://domain.com/path/file/0and3and0011.jpg");
		assert.equal(links[2], "http://domain.com/path/file/0and3and0012.jpg");
		assert.equal(links[3], "http://domain.com/path/file/0and3and0013.jpg");
		assert.equal(links[4], "http://domain.com/path/file/0and4and0010.jpg");
		assert.equal(links[5], "http://domain.com/path/file/0and4and0011.jpg");
		assert.equal(links[6], "http://domain.com/path/file/0and4and0012.jpg");
		assert.equal(links[7], "http://domain.com/path/file/0and4and0013.jpg");
		assert.equal(links[8], "http://domain.com/path/file/0and5and0010.jpg");
		assert.equal(links[9], "http://domain.com/path/file/0and5and0011.jpg");
		assert.equal(links[199], "http://domain.com/path/file/9and7and0013.jpg");
	});

	QUnit.test("URL - Fuskable file [0-9] {0}", function (assert) {
		var url = "http://domain.com/path/file/[0-9]and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(10, links.length, "Link array length should be 10");
		assert.equal(links[0], "http://domain.com/path/file/0and0.jpg", "First element wrong");
		assert.equal(links[4], "http://domain.com/path/file/4and4.jpg", "Fifth element wrong");
		assert.equal(links[7], "http://domain.com/path/file/7and7.jpg", "Eigth element wrong");
		assert.equal(links[9], "http://domain.com/path/file/9and9.jpg", "Last element wrong");
	});

	QUnit.test("URL - Fuskable file [a-z] {0}", function (assert) {
		var url = "http://domain.com/path/file/[a-z]and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(26, links.length, "Link array length should be 26");
		assert.equal(links[0], "http://domain.com/path/file/aanda.jpg", "First element wrong");
		assert.equal(links[4], "http://domain.com/path/file/eande.jpg", "Fifth element wrong");
		assert.equal(links[7], "http://domain.com/path/file/handh.jpg", "Eigth element wrong");
		assert.equal(links[25], "http://domain.com/path/file/zandz.jpg", "Last element wrong");
	});

	QUnit.test("URL - Fuskable file [0-9] [3-7] {1}", function (assert) {
		var url = "http://domain.com/path/file/[0-9]and[3-7]and{1}.jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(50, links.length, "Link array length should be 50");
		assert.equal(links[0], "http://domain.com/path/file/0and3and3.jpg");
		assert.equal(links[1], "http://domain.com/path/file/0and4and4.jpg");
		assert.equal(links[2], "http://domain.com/path/file/0and5and5.jpg");
		assert.equal(links[3], "http://domain.com/path/file/0and6and6.jpg");
		assert.equal(links[4], "http://domain.com/path/file/0and7and7.jpg");
		assert.equal(links[5], "http://domain.com/path/file/1and3and3.jpg");
		assert.equal(links[6], "http://domain.com/path/file/1and4and4.jpg");
		assert.equal(links[7], "http://domain.com/path/file/1and5and5.jpg");
		assert.equal(links[8], "http://domain.com/path/file/1and6and6.jpg");
		assert.equal(links[9], "http://domain.com/path/file/1and7and7.jpg");
		assert.equal(links[49], "http://domain.com/path/file/9and7and7.jpg");
	});

	QUnit.test("URL - Fuskable file [a-z] [c-g] {1}", function (assert) {
		var url = "http://domain.com/path/file/[a-z]and[c-g]and{1}.jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(130, links.length, "Link array length should be 130");
		assert.equal(links[0], "http://domain.com/path/file/aandcandc.jpg");
		assert.equal(links[1], "http://domain.com/path/file/aanddandd.jpg");
		assert.equal(links[2], "http://domain.com/path/file/aandeande.jpg");
		assert.equal(links[3], "http://domain.com/path/file/aandfandf.jpg");
		assert.equal(links[4], "http://domain.com/path/file/aandgandg.jpg");
		assert.equal(links[5], "http://domain.com/path/file/bandcandc.jpg");
		assert.equal(links[6], "http://domain.com/path/file/banddandd.jpg");
		assert.equal(links[7], "http://domain.com/path/file/bandeande.jpg");
		assert.equal(links[8], "http://domain.com/path/file/bandfandf.jpg");
		assert.equal(links[9], "http://domain.com/path/file/bandgandg.jpg");
		assert.equal(links[49], "http://domain.com/path/file/jandgandg.jpg");
		assert.equal(links[129], "http://domain.com/path/file/zandgandg.jpg");
	});

	QUnit.test("URL - Fuskable file {1} [0-9] [3-7] {0}", function (assert) {
		var url = "http://domain.com/path/file/{1}and[0-9]then[3-7]and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(50, links.length, "Link array length should be 50");
		assert.equal(links[0], "http://domain.com/path/file/3and0then3and0.jpg");
		assert.equal(links[1], "http://domain.com/path/file/4and0then4and0.jpg");
		assert.equal(links[2], "http://domain.com/path/file/5and0then5and0.jpg");
		assert.equal(links[3], "http://domain.com/path/file/6and0then6and0.jpg");
		assert.equal(links[4], "http://domain.com/path/file/7and0then7and0.jpg");
		assert.equal(links[5], "http://domain.com/path/file/3and1then3and1.jpg");
		assert.equal(links[6], "http://domain.com/path/file/4and1then4and1.jpg");
		assert.equal(links[7], "http://domain.com/path/file/5and1then5and1.jpg");
		assert.equal(links[8], "http://domain.com/path/file/6and1then6and1.jpg");
		assert.equal(links[9], "http://domain.com/path/file/7and1then7and1.jpg");
		assert.equal(links[49], "http://domain.com/path/file/7and9then7and9.jpg");
	});

	QUnit.test("URL - Fuskable file [0-9] {0} {0} {0} {0}", function (assert) {
		var url = "http://domain.com/path/file/[0-9]and{0}and{0}and{0}and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(10, links.length, "Link array length should be 10");
		assert.equal(links[0], "http://domain.com/path/file/0and0and0and0and0.jpg");
		assert.equal(links[1], "http://domain.com/path/file/1and1and1and1and1.jpg");
		assert.equal(links[2], "http://domain.com/path/file/2and2and2and2and2.jpg");
		assert.equal(links[3], "http://domain.com/path/file/3and3and3and3and3.jpg");
		assert.equal(links[4], "http://domain.com/path/file/4and4and4and4and4.jpg");
		assert.equal(links[5], "http://domain.com/path/file/5and5and5and5and5.jpg");
		assert.equal(links[6], "http://domain.com/path/file/6and6and6and6and6.jpg");
		assert.equal(links[7], "http://domain.com/path/file/7and7and7and7and7.jpg");
		assert.equal(links[8], "http://domain.com/path/file/8and8and8and8and8.jpg");
		assert.equal(links[9], "http://domain.com/path/file/9and9and9and9and9.jpg");
	});

	QUnit.test("URL - Fuskable file [a-z] {0} {0} {0} {0}", function (assert) {
		var url = "http://domain.com/path/file/[a-z]and{0}and{0}and{0}and{0}.jpg";
		var links = Fuskr.GetLinks(url);
		assert.equal(true, !!links.push, "Result should be an array");
		assert.equal(26, links.length, "Link array length should be 26");
		assert.equal(links[0], "http://domain.com/path/file/aandaandaandaanda.jpg");
		assert.equal(links[1], "http://domain.com/path/file/bandbandbandbandb.jpg");
		assert.equal(links[2], "http://domain.com/path/file/candcandcandcandc.jpg");
		assert.equal(links[3], "http://domain.com/path/file/danddanddanddandd.jpg");
		assert.equal(links[4], "http://domain.com/path/file/eandeandeandeande.jpg");
		assert.equal(links[5], "http://domain.com/path/file/fandfandfandfandf.jpg");
		assert.equal(links[6], "http://domain.com/path/file/gandgandgandgandg.jpg");
		assert.equal(links[7], "http://domain.com/path/file/handhandhandhandh.jpg");
		assert.equal(links[8], "http://domain.com/path/file/iandiandiandiandi.jpg");
		assert.equal(links[25], "http://domain.com/path/file/zandzandzandzandz.jpg");
	});
});