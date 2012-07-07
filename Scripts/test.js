$(function(){
	console.log(Fuskr.ConvertCharToInt("A"), Fuskr.ConvertCharToInt("Z"));
	console.log(Fuskr.ConvertCharToInt("a"), Fuskr.ConvertCharToInt("z"));
	$("#submit").click(function(){
		var parsedLinks = Fuskr.GetLinks($("#text").val());

		$.each(parsedLinks, function(i,v){
			$("#results").val($("#results").val() + v + "\r\n");
		});
	});
});