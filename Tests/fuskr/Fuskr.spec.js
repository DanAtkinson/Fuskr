/*globals describe:false, it:false, expect:false, Fuskr, jasmine */

describe('Fuskr', function () {

	it('Fuskr Object Exists', function () {
		expect(Fuskr).toBeDefined();
		expect(Fuskr).toEqual(jasmine.any(Object));
	});

});
