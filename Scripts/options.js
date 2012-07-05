$(function() {
	//Open in Foreground value
	var openInForegroundVal = localStorage.getItem("openInForeground");
	var openInForeground = parseInt(openInForegroundVal, 10);
	if (openInForeground !== 0 && openInForeground !== 1) {
		localStorage.setItem("openInForeground", 1);
		openInForeground = 1;
	}
	
	if(openInForeground === 1) {
		$("#openInForeground").attr("checked", "checked");
	}

	//Keep Recent Fusks value`
	var keepRecentFusksVal = localStorage.getItem("keepRecentFusks");
	var keepRecentFusks = parseInt(keepRecentFusksVal, 10);
	if (keepRecentFusks !== 0 && keepRecentFusks !== 1) {
		localStorage.setItem("keepRecentFusks", 1);
		keepRecentFusks = 1;
	}
	
	if(keepRecentFusks === 1) {
		$("#keepRecentFusks").attr("checked", "checked");
	}

	//Get the history
	var history = localStorage.getItem("history");

	if(history != null) {
		//Push the rest of the urls onto the pile onto the array
		var tempHistory = history.split("||");
		for(var i = 0; i < tempHistory.length; i++) {
			$("#recentFusks").append("<option>"+tempHistory[i]+"</option>");
		}
		
		var selectLength = tempHistory.length > 10 ? 10 : tempHistory.length;
		$("p span.totalFusks").html(tempHistory.length);
		
		$("#recentFusks").attr("size", selectLength);
		
		$("#recentFusks option").click(function() {
			chrome.tabs.create({ url:"/Html/images.htm?url=" + $(this).val(), selected: openInForeground === 1 });
			return false;
		});
	}
	
	if($.trim($("#recentFusks").html()) === "") {
		$("#recentFusksArea")
		.hide()
		.before('<p class="bold">There are currently no records of any galleries created. When you start using Fuskr, the gallery links will appear below!</p>');
	}

	/*var shareFusks = parseInt(localStorage.getItem("shareFusks"), 10);
	if (shareFusks !== 0 && shareFusks !== 1) {
		localStorage.setItem("shareFusks", 0);
		shareFusks = 0;
	}
	$("#shareFusks").attr("checked", shareFusks === 1 ? "checked" : "");
	*/

	//Save those options!
	$("input.saveButton").click(function() {
		$("#saveInfo").empty();

		$("input:checkbox").each(function() {
			localStorage.setItem($(this).attr("id"), $(this).is(':checked') ? 1 : 0);
		});

		$("#saveInfo").animate({ opacity: 0.1 }, "slow", function(){
			$("#saveInfo").html("<p>Saved!</p>");
		}).animate({ opacity: 1.0 }, "slow");
	});
});