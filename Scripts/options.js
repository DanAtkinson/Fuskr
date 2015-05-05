// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function (){
	var cache = {};

	this.tmpl = function tmpl(str, data){

		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
			cache[str] = cache[str] ||
			tmpl(document.getElementById(str).innerHTML) :

			// Generate a reusable function that will serve as a template
			// generator (and which will be cached).
			new Function("obj",
			"var p=[],print=function (){p.push.apply(p,arguments);};" +

			// Introduce the data as local variables using with(){}
			"with(obj){p.push('" +
			// Convert the template into pure JavaScript
			str
				.replace(/[\r\t\n]/g, " ")
				.split("<%").join("\t")
				.replace(/((^|%>)[^\t]*)'/g, "$1\r")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("p.push('")
				.split("\r").join("\\'")
			+ "');}return p.join('');");

		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	};
} ());

$(function () {
	var $content = $("body");

	(function () {
		document.title = l18nify("Title");

		var pageTemplate = tmpl("pageTemplate");
		$content.append(pageTemplate({
			Fuskr: l18nify("ManifestName", ""),
			Tab_Foreground: l18nify("Tab_Foreground"),
			Tab_Settings: l18nify("Tab_Settings"),
			Tab_History: l18nify("Tab_History"),
			Tab_VersionHistory: l18nify("Tab_VersionHistory"),
			Tab_About: l18nify("Tab_About"),
			OpenNewFusksInForeground: l18nify("OpenNewFusksInForeground"),
			OpenNewFusksInForeground_Default: l18nify("OpenNewFusksInForeground_Default"),
			OpenNewFusksInForeground_Description: l18nify("OpenNewFusksInForeground_Description"),
			About_Description: l18nify("About_Description"),
			History_Keep: l18nify("History_Keep"),
			History_Keep_Default: l18nify("History_Keep_Default"),
			History_Keep_Limit: l18nify("History_Keep_Limit"),

			CreditsTitle: l18nify("Credits_Title"),
			Credits_Description: l18nify("Credits_Description")
		}));

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
	} ());

	function l18nify(name, base) {
console.log(name, "= '", chrome.i18n.getMessage((base === "" ? base : "Options_") + name), "'");
		return chrome.i18n.getMessage((base === "" ? base : "Options_") + name);
	}

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
