$(function(){
	module("Fuskr");

	test("Fuskr Object Exists", function() {
		equal(!!Fuskr, true, "Fuskr exists" );
		equal(typeof(Fuskr), "object", "Fuskr is an object" );
	});
});