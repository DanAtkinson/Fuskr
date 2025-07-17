/*globals describe:false, it:false, expect:false, Fuskr, jasmine */

describe('Fuskr - GetLinks', function () {

	it('Function exists', function () {
		expect(Fuskr.GetLinks).toEqual(jasmine.any(Function));
	});

	it('Null url', function () {
		var url,
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(0);
	});

	it('Empty string Url', function () {
		var url = '',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(0);
	});

	it('Object / Invalid parameter Url', function () {
		var url = { hey: 'ho' },
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(0);
	});

	it('Array / Invalid parameter Url', function () {
		var url = ['string', 1234, { obj: 'ject' }],
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(0);
	});

	it('URL - Unfuskable', function () {
		var url = 'http://domain.com/path/file/',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(0);
	});

	it('URL - Fuskable file [0-9]', function () {
		var url = 'http://domain.com/path/file/[0-9].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(10);

		expect(links[0]).toEqual('http://domain.com/path/file/0.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/4.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/7.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/9.jpg');
	});

	it('URL - Fuskable file [a-z]', function () {
		var url = 'http://domain.com/path/file/[a-z].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(26);
		expect(links[0]).toEqual('http://domain.com/path/file/a.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/e.jpg');
		expect(links[12]).toEqual('http://domain.com/path/file/m.jpg');
		expect(links[25]).toEqual('http://domain.com/path/file/z.jpg');
	});

	it('URL - Fuskable file [8-16]', function () {
		var url = 'http://domain.com/path/file/[8-16].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(9);
		expect(links[0]).toEqual('http://domain.com/path/file/8.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/9.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/10.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/11.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/16.jpg');
	});

	it('URL - Fuskable file [h-p]', function () {
		var url = 'http://domain.com/path/file/[h-p].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(9);
		expect(links[0]).toEqual('http://domain.com/path/file/h.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/i.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/j.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/k.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/p.jpg');
	});

	it('URL - Fuskable file [08-16]', function () {
		var url = 'http://domain.com/path/file/[08-16].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(9);
		expect(links[0]).toEqual('http://domain.com/path/file/08.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/09.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/10.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/11.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/16.jpg');
	});

	it('URL - Fuskable file [0-9] [3-7]', function () {
		var url = 'http://domain.com/path/file/[0-9]and[3-7].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(50);
		expect(links[0]).toEqual('http://domain.com/path/file/0and3.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/0and4.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/0and5.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/0and6.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/0and7.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/1and3.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/1and4.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/1and5.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/1and6.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/1and7.jpg');
		expect(links[49]).toEqual('http://domain.com/path/file/9and7.jpg');
	});

	it('URL - Fuskable file [a-z] [c-g]', function () {
		var url = 'http://domain.com/path/file/[a-z]and[c-g].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(130);
		expect(links[0]).toEqual('http://domain.com/path/file/aandc.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/aandd.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/aande.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/aandf.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/aandg.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/bandc.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/bandd.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/bande.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/bandf.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/bandg.jpg');
		expect(links[49]).toEqual('http://domain.com/path/file/jandg.jpg');
		expect(links[129]).toEqual('http://domain.com/path/file/zandg.jpg');
	});

	it('URL - Fuskable file [0-9] [c-g]', function () {
		var url = 'http://domain.com/path/file/[0-9]and[c-g].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(50);
		expect(links[0]).toEqual('http://domain.com/path/file/0andc.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/0andd.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/0ande.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/0andf.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/0andg.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/1andc.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/1andd.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/1ande.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/1andf.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/1andg.jpg');
		expect(links[49]).toEqual('http://domain.com/path/file/9andg.jpg');
		expect(links[49]).toEqual('http://domain.com/path/file/9andg.jpg');
	});

	it('URL - Fuskable file [0-9] [3-7] [10-13]', function () {
		var url = 'http://domain.com/path/file/[0-9]and[3-7]and[10-13].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(200);
		expect(links[0]).toEqual('http://domain.com/path/file/0and3and10.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/0and3and11.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/0and3and12.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/0and3and13.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/0and4and10.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/0and4and11.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/0and4and12.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/0and4and13.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/0and5and10.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/0and5and11.jpg');
		expect(links[199]).toEqual('http://domain.com/path/file/9and7and13.jpg');
	});

	it('URL - Fuskable file [a-z] [c-g] [j-m]', function () {
		var url = 'http://domain.com/path/file/[a-z]and[c-g]and[j-m].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(520);
		expect(links[0]).toEqual('http://domain.com/path/file/aandcandj.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/aandcandk.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/aandcandl.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/aandcandm.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/aanddandj.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/aanddandk.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/aanddandl.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/aanddandm.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/aandeandj.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/aandeandk.jpg');
		expect(links[519]).toEqual('http://domain.com/path/file/zandgandm.jpg');
	});

	it('URL - Fuskable file [0-9] [c-g] [j-m]', function () {
		var url = 'http://domain.com/path/file/[0-9]and[c-g]and[j-m].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(200);
		expect(links[0]).toEqual('http://domain.com/path/file/0andcandj.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/0andcandk.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/0andcandl.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/0andcandm.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/0anddandj.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/0anddandk.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/0anddandl.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/0anddandm.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/0andeandj.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/0andeandk.jpg');
		expect(links[199]).toEqual('http://domain.com/path/file/9andgandm.jpg');
	});

	it('URL - Fuskable file [0-9] [3-7] [0010-0013]', function () {
		var url = 'http://domain.com/path/file/[0-9]and[3-7]and[0010-0013].jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(200);
		expect(links[0]).toEqual('http://domain.com/path/file/0and3and0010.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/0and3and0011.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/0and3and0012.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/0and3and0013.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/0and4and0010.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/0and4and0011.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/0and4and0012.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/0and4and0013.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/0and5and0010.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/0and5and0011.jpg');
		expect(links[199]).toEqual('http://domain.com/path/file/9and7and0013.jpg');
	});

	it('URL - Fuskable file [0-9] {0}', function () {
		var url = 'http://domain.com/path/file/[0-9]and{0}.jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(10);
		expect(links[0]).toEqual('http://domain.com/path/file/0and0.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/4and4.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/7and7.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/9and9.jpg');
	});

	it('URL - Fuskable file [a-z] {0}', function () {
		var url = 'http://domain.com/path/file/[a-z]and{0}.jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(26);
		expect(links[0]).toEqual('http://domain.com/path/file/aanda.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/eande.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/handh.jpg');
		expect(links[25]).toEqual('http://domain.com/path/file/zandz.jpg');
	});

	it('URL - Fuskable file [0-9] [3-7] {1}', function () {
		var url = 'http://domain.com/path/file/[0-9]and[3-7]and{1}.jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(50);
		expect(links[0]).toEqual('http://domain.com/path/file/0and3and3.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/0and4and4.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/0and5and5.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/0and6and6.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/0and7and7.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/1and3and3.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/1and4and4.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/1and5and5.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/1and6and6.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/1and7and7.jpg');
		expect(links[49]).toEqual('http://domain.com/path/file/9and7and7.jpg');
	});

	it('URL - Fuskable file [a-z] [c-g] {1}', function () {
		var url = 'http://domain.com/path/file/[a-z]and[c-g]and{1}.jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(130);
		expect(links[0]).toEqual('http://domain.com/path/file/aandcandc.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/aanddandd.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/aandeande.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/aandfandf.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/aandgandg.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/bandcandc.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/banddandd.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/bandeande.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/bandfandf.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/bandgandg.jpg');
		expect(links[49]).toEqual('http://domain.com/path/file/jandgandg.jpg');
		expect(links[129]).toEqual('http://domain.com/path/file/zandgandg.jpg');
	});

	it('URL - Fuskable file {1} [0-9] [3-7] {0}', function () {
		var url = 'http://domain.com/path/file/{1}and[0-9]then[3-7]and{0}.jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(50);
		expect(links[0]).toEqual('http://domain.com/path/file/3and0then3and0.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/4and0then4and0.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/5and0then5and0.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/6and0then6and0.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/7and0then7and0.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/3and1then3and1.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/4and1then4and1.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/5and1then5and1.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/6and1then6and1.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/7and1then7and1.jpg');
		expect(links[49]).toEqual('http://domain.com/path/file/7and9then7and9.jpg');
	});

	it('URL - Fuskable file [0-9] {0} {0} {0} {0}', function () {
		var url = 'http://domain.com/path/file/[0-9]and{0}and{0}and{0}and{0}.jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(10);
		expect(links[0]).toEqual('http://domain.com/path/file/0and0and0and0and0.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/1and1and1and1and1.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/2and2and2and2and2.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/3and3and3and3and3.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/4and4and4and4and4.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/5and5and5and5and5.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/6and6and6and6and6.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/7and7and7and7and7.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/8and8and8and8and8.jpg');
		expect(links[9]).toEqual('http://domain.com/path/file/9and9and9and9and9.jpg');
	});

	it('URL - Fuskable file [a-z] {0} {0} {0} {0}', function () {
		var url = 'http://domain.com/path/file/[a-z]and{0}and{0}and{0}and{0}.jpg',
			links = Fuskr.GetLinks(url);

		expect(links).toEqual(jasmine.any(Array));
		expect(links.length).toEqual(26);
		expect(links[0]).toEqual('http://domain.com/path/file/aandaandaandaanda.jpg');
		expect(links[1]).toEqual('http://domain.com/path/file/bandbandbandbandb.jpg');
		expect(links[2]).toEqual('http://domain.com/path/file/candcandcandcandc.jpg');
		expect(links[3]).toEqual('http://domain.com/path/file/danddanddanddandd.jpg');
		expect(links[4]).toEqual('http://domain.com/path/file/eandeandeandeande.jpg');
		expect(links[5]).toEqual('http://domain.com/path/file/fandfandfandfandf.jpg');
		expect(links[6]).toEqual('http://domain.com/path/file/gandgandgandgandg.jpg');
		expect(links[7]).toEqual('http://domain.com/path/file/handhandhandhandh.jpg');
		expect(links[8]).toEqual('http://domain.com/path/file/iandiandiandiandi.jpg');
		expect(links[25]).toEqual('http://domain.com/path/file/zandzandzandzandz.jpg');
	});
});
