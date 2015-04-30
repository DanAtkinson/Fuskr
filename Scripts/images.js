// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
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
			"var p=[],print=function(){p.push.apply(p,arguments);};" +

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
})();

$(function() {

	var image = $('<img src="/Images/128x128.png" />');
	var brokenImagesCount = 0,
		loaded = 0,
		total = 0,
		resizeOn = false,
		showHiddenImages = false;

	var currentUrl = (function() {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] == "url") {
				return pair[1];
			}
		}
	})();

	(function (url) {
		var $content = $("#content");

		var info = tmpl("info_tmpl");
		$content.before(info({ Position: "top" }));
		$content.after(info({ Position: "bottom" }));

		var title = url.replace(/(^(http\:\/\/|https\:\/\/)?(www\.)?)/g, "");
		document.title = "Fuskr - " + title;
		$("p.fuskUrl").html(title);

		var parsedLinks = Fuskr.GetLinks(url);
		total = parsedLinks.length;

		$("div.info span.total").html(total);

		var linkData = $.map(parsedLinks, function(item, i) {
			return {
				"Index" : i,
				"Link" : item,
				"Total" : parsedLinks.length,
				"PreviousImage": i === 0 ? "hide" : "",
				"NextImage": i > (parsedLinks.length - 1) ? "hide" : ""
			};
		});

		$content.empty();


		var show_user = tmpl("item_tmpl");
		for ( var i = 0; i < linkData.length; i++ ) {
			$content.append(show_user(linkData[i]));
		}
	}(currentUrl));

	//Start the images hidden and show as each one loads.
	$("div#content img.fuskImage")
		.load(function () {
			$("div.info span.loaded").html(++loaded);
			$(this).parents("div.wrap").removeClass("hide").addClass("loaded");
			checkForCompletion();
		})
		.error(function() {
			brokenImagesCount++;
			$(this).closest(".wrap").addClass("error");
			$("div.info span.broken").html(brokenImagesCount);
			checkForCompletion();
		});

	//Get the users current option regarding showing images in their full resolution or scaling them to the current window size.
	$("a.resizeImages").click(function() {
		resizeOn = !resizeOn;

		if(resizeOn) {
			$("div.wrap img").css("width","100%");
			$(this).text("Resize images to full width");
		} else {
			$("div.wrap img").css("width","");
			$(this).text("Resize images to fit on page");
		}
		return false;
	});

	$("a.toggleBrokenLinks").click(function(e) {
		e.preventDefault();
		showHiddenImages = !showHiddenImages;
		$(this).find("span.showHide").html(!document.styleSheets[0].disabled ? "Hide" : "Show");
		document.styleSheets[0].disabled = !document.styleSheets[0].disabled;
		return false;
	});

	$("a.downloadImages").click(function() {
		var imageUrl = "";
		//https://developer.chrome.com/extensions/downloads#method-download
		//chrome.downloads.download
		$("div.loaded a.imageLink").each(function () {
			var imageUrl = $(this).attr("href");
			chrome.downloads.download({
				url: imageUrl
			},function () {
				console.log("Completed download");
			});
		});
	});

	$("a.previousImage").click(function(e) {
		e.preventDefault();
		scrollTo($(this), -1);
	});

	$("a.nextImage").click(function(e) {
		e.preventDefault();
		scrollTo($(this), 1);
	});

	function scrollTo(element, direction) {
		var offset = 0;
		var parent = element.parents("div.wrap");
		var elementSelector = showHiddenImages ? "div.wrap" : "div.loaded";

		//get the offset of the target anchor
		if(direction === 1) {
			offset = parent.nextAll(elementSelector).first().offset();
		} else {
			offset = parent.prevAll(elementSelector).first().offset();
		}

		if(offset != null) {
			//goto that anchor by setting the body scroll top to anchor top
			$('html, body').animate({scrollTop:offset.top}, 500);
		}
	}

	function checkForCompletion() {
		if(total == (brokenImagesCount + loaded)) {
			$("p.fuskTotals").append(" Done!");
		}
	}

	function replaceAll(txt, replace, replacement) {
		return txt.replace(new RegExp(replace, 'g'), replacement);
	}
});
