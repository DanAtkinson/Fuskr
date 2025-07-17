/*globals describe:false, it:false, expect:false, Fuskr, jasmine */

describe('IsFuskable', function () {

	it('Function exists', function () {
		expect(Fuskr.IsFuskable).toEqual(jasmine.any(Function));
	});

	it('Null url', function () {
		var url;
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	it('Empty string Url', function () {
		var url = '';
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	it('Object / Invalid parameter Url', function () {
		var url = { hey: 'ho' };
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	it('Array / Invalid parameter Url', function () {
		var url = ['string', 1234, { obj: 'ject' }];
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	it('URL - Unfuskable - no numbers', function () {
		var url = 'http://domain.com/path/file/';
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	//URL - Unfuskable (unclosed)
	it('URL - Unfuskable (unclosed)', function () {
		var url = 'http://domain.com/path/file/[0-9.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(false);

		url = 'http://domain.com/path/file/[a-z.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	//URL - Unfuskable (unopen)
	it('URL - Unfuskable (unopen)', function () {
		var url = 'http://domain.com/path/file/0-9].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(false);

		url = 'http://domain.com/path/file/a-z].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	//URL - Unfuskable (symbols)
	it('URL - Unfuskable (symbols)', function () {
		var url = 'http://domain.com/path/file/[0-$&].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(false);

		url = 'http://domain.com/path/file/[a-$&].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	//URL - Unfuskable (malformed)
	it('URL - Unfuskable (malformed)', function () {
		var url = 'http://domain.com/path/file/[0-45[.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(false);

		url = 'http://domain.com/path/file/[a-z[.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(false);
	});

	it('URL - Fuskable file [0-9]/[a-z]', function () {
		var url = 'http://domain.com/path/file/[0-9].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path/file/[a-z].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with file [0-9]/[a-z]', function () {
		var url = 'http://domain.com/path[0-9]/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with no file [0-9]/[a-z]', function () {
		var url = 'http://domain.com/path[0-9]/';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]/';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with no file [0-9]/[a-z] and no trailing slash', function () {
		var url = 'http://domain.com/path[0-9]';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable domain with file [0-9]/[a-z]', function () {
		var url = 'http://domain[0-9].com/path/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain[a-z].com/path/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable domain with path only [0-9]/[a-z]', function () {
		var url = 'http://domain[0-9].com/path';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain[a-z].com/path';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	/*********************************/
	it('URL - Fuskable file - [0-9]/[a-z] (multiple fusks)', function () {
		var url = 'http://domain.com/path/file[0-9]another[0-9].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path/file[a-z]another[a-z].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with file [0-9]/[a-z] (multiple fusks)', function () {
		var url = 'http://domain.com/path[0-9]another[0-9]/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]another[a-z]/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with no file [0-9]/[a-z] (multiple fusks)', function () {
		var url = 'http://domain.com/path[0-9]another[0-9]/';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]another[a-z]/';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with no file [0-9]/[a-z] and no trailing slash (multiple fusks)', function () {
		var url = 'http://domain.com/path[0-9]another[0-9]';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]another[a-z]';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable domain with file [0-9]/[a-z] (multiple fusks)', function () {
		var url = 'http://domain[0-9]another[0-9].com/path/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain[a-z]another[a-z].com/path/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable domain with path only [0-9]/[a-z] (multiple fusks)', function () {
		var url = 'http://domain[0-9]another[0-9].com/path';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain[a-z]another[a-z].com/path';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	/*********************************/

	it('URL - Fuskable file - [0-9]/[a-z] (dual fusks after)', function () {
		var url = 'http://domain.com/path/file[0-9]another{0}.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path/file[a-z]another{0}.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with file [0-9]/[a-z] (dual fusks after)', function () {
		var url = 'http://domain.com/path[0-9]another{0}/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]another{0}/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with no file [0-9/[a-z]] (dual fusks after)', function () {
		var url = 'http://domain.com/path[0-9]another{0}';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]another{0}';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with no file [0-9]/[a-z] and no trailing slash (dual fusks after)', function () {
		var url = 'http://domain.com/path[0-9]another{0}';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path[a-z]another{0}';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable domain with file [0-9]/[a-z] (dual fusks after)', function () {
		var url = 'http://domain[0-9]another{0}.com/path/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain[a-z]another{0}.com/path/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable domain with path only [0-9]/[a-z] (dual fusks after)', function () {
		var url = 'http://domain[0-9]another{0}.com/path';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain[a-z]another{0}.com/path';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable file {0} (dual fusks before)', function () {
		var url = 'http://domain.com/path/file/{0}another[0-9].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path/file/{0}another[a-z].jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with file {0} (dual fusk before)', function () {
		var url = 'http://domain.com/path{0}another[0-9]/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path{0}another[a-z]/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with no file {0} (dual fusk before)', function () {
		var url = 'http://domain.com/path{0}another[0-9]/';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path{0}another[a-z]/';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable path with no file {0} and no trailing slash (dual fusk before)', function () {
		var url = 'http://domain.com/path{4}another[0-9]';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain.com/path{4}another[a-z]';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable domain with file {0} (dual fusk before)', function () {
		var url = 'http://domain{1}another[0-9].com/path/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain{1}another[a-z].com/path/file.jpg';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});

	it('URL - Fuskable domain with path only {0} (dual fusk before)', function () {
		var url = 'http://domain{2}another[0-9].com/path';
		expect(Fuskr.IsFuskable(url)).toEqual(true);

		url = 'http://domain{2}another[a-z].com/path';
		expect(Fuskr.IsFuskable(url)).toEqual(true);
	});
});
