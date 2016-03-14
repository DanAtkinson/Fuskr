QUnit.module("Fuskr", function(){

	QUnit.test("Fuskr Object Exists", function(assert) {
		assert.equal(!!Fuskr, true, "Fuskr exists" );
		assert.equal(typeof(Fuskr), "object", "Fuskr is an object" );
	});

});