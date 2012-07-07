$(function() {
	setOpenInForeground();

	setKeepRecentFusks();

	getHistory();

	if($.trim($("#recentFusks").html()) === "") {
		$("#recentFusksArea")
		.hide()
		.before('<p class="bold">There are currently no records of any galleries created. When you start using Fuskr, the gallery links will appear below!</p>');
	}

	$("#openInForeground, #keepRecentFusks").change(function() {
		localStorage.setItem($(this).attr("id"), $(this).is(':checked') ? 1 : 0);
		$(this).parents("div.tab-content").effect("highlight", {}, 1000);
	});

	$(".tab").click(function(){
		if(!$(this).hasClass("active")) {
			$(".tab-content").removeClass("show");
			$("." + $(this).attr("data-type")).addClass("show");

			$(".tab").removeClass("active");
			$(this).addClass("active");
		}
	});

	function setKeepRecentFusks() {
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
	}

	function setOpenInForeground() {
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
	}

	function getHistory() {
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
	}
});