$(document).ready(function(){
	module("Fuskr");

	test("Fuskr Object Exists", function() {
		equals(!!Fuskr, true, "Fuskr exists" );
		equals(typeof(Fuskr), "object", "Fuskr is an object" );
	});
});