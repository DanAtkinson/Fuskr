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

	var image, brokenImagesCount, loaded, total, resizeOn, showHiddenImages, conflictAction, currentUrl, dialog, showViewer, currentSelectedImage;

	(function () {
		var
			i = 0,
			url = "",
			pair = "",
			linkData,
			show_user,
			title = "",
			parsedLinks = "",
			$content = $("#content"),
			info = tmpl("info_tmpl"),
			query = window.location.search.substring(1),
			vars = query.split("&");

		//Set url.
		for (i = 0; i < vars.length; i++) {
			pair = vars[i].split("=");
			if (pair[0] == "url") {
				url = pair[1];
				break;
			}
		}

		if (url !== "") {
			title = url.replace(/(^(http\:\/\/|https\:\/\/)?(www\.)?)/g, "");
			document.title = "Fuskr - " + title;
			$("p.fuskUrl").html(title);

			parsedLinks = Fuskr.GetLinks(url);
		} else {

		}

		$content.before(info({ Position: "top" }));
		$content.after(info({ Position: "bottom" }));

		total = parsedLinks.length;

		$("div.info span.total").html(total);

		linkData = $.map(parsedLinks, function(item, i) {
			return {
				"Index" : i,
				"Link" : item,
				"Total" : parsedLinks.length,
				"PreviousImage": i === 0 ? "hide" : "",
				"NextImage": i > (parsedLinks.length - 1) ? "hide" : ""
			};
		});

		$content.empty();

		show_user = tmpl("item_tmpl");
		for (i = 0; i < linkData.length; i++) {
			$content.append(show_user(linkData[i]));
		}

		brokenImagesCount = 0;
		loaded = 0;
		total = 0;
		resizeOn = false;
		showHiddenImages = false;
		conflictAction: "uniquify";
		image = $('<img src="/Images/128x128.png" />');

		dialog = $("#download-form").dialog({
			autoOpen: false,
			height: 500,
			width: 650,
			modal: true,
			buttons: {
				Cancel: function() {
					$("#download-form form")[0].reset();
					dialog.dialog("close");
				},
				Download: function () {
					conflictAction = $("#download-form form select").val();
					dialog.dialog("close");
					downloadAll();
				}
			},
			close: function() {
				$("#download-form form")[0].reset();
			}
		});


	}());

	function setCurrentImageInViewer($currentImage)
	{ 
		// There is no element (we've reached an end)
		if($currentImage.length == 0) return;

		currentSelectedImage = $currentImage;

		// get img (if it exists + was loaded)
		var elementSelector = showHiddenImages ? "div.wrap" : "div.loaded";

		var parent = $currentImage.parents("div.wrap");

		var img = $currentImage[0];
		var prev_img = parent.prevAll(elementSelector).first().find(".fuskImage")[0];
		var next_img = parent.nextAll(elementSelector).first().find(".fuskImage")[0];

		$(".viewerItem.current a").css("background-image", "url(" + (img && img.src) +")");
		$(".viewerItem a.previousImage").css("background-image", "url(" + (prev_img && prev_img.src) +")");
		$(".viewerItem a.nextImage").css("background-image", "url(" + (next_img && next_img.src) +")");
	}

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

	function toggleViewer()
	{
		// First view
		if (!currentSelectedImage) {
			currentSelectedImage = $("div.loaded").find(".fuskImage").first();
			setCurrentImageInViewer(currentSelectedImage, 1);
		}

		showViewer = !showViewer;
    	$("#viewer").toggle(showViewer);
	}

	$("a.showViewer, .viewerItem a").click(function(e) {
		e.preventDefault();
		toggleViewer();
	});

	$("a.toggleBrokenLinks").click(function(e) {
		e.preventDefault();
		showHiddenImages = !showHiddenImages;
		$(this).find("span.showHide").html(!document.styleSheets[0].disabled ? "Hide" : "Show");
		document.styleSheets[0].disabled = !document.styleSheets[0].disabled;
		return false;
	});

	$("a.downloadImages").click(function(e) {
		e.preventDefault();

		dialog.dialog( "open" );
	});

	$("a.previousImage").click(function(e) {
		e.preventDefault();
		scrollTo($(this), -1);
	});

	$("a.nextImage").click(function(e) {
		e.preventDefault();
		scrollTo($(this), 1);
	});

	// Hook into the Left/Right keys. This is down even if the viewer is not shown
	// so that the current viewed item is synced
	$(document).keydown(function(e) {
	    switch(e.which) {
	        case 27: // escape
				toggleViewer()
	        break;

	        case 37: // left
	        	scrollTo(currentSelectedImage, -1);
	        break;

	        case 39: // right
	        	scrollTo(currentSelectedImage, 1);
	        break;

	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	function scrollTo(element, direction) {
		var offset = 0;
		var parent = element.parents("div.wrap");
		var elementSelector = showHiddenImages ? "div.wrap" : "div.loaded";

		var $nextImage = parent.nextAll(elementSelector).first();
		var $prevImage = parent.prevAll(elementSelector).first();

		//get the offset of the target anchor
		//update the image in the viewer window
		if(direction === 1) {
			offset = $nextImage.offset();
			setCurrentImageInViewer($nextImage.find(".fuskImage"));
		} else {
			offset = $prevImage.offset();
			setCurrentImageInViewer($prevImage.find(".fuskImage"));
		}

		if(offset != null) {
			//goto that anchor by setting the body scroll top to anchor top
			//skip animation if we are in Viewer mode
			$('html, body').animate({scrollTop:offset.top}, showViewer ? 0 : 500);
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

	function downloadAll() {
		$("div.loaded a.imageLink").each(function () {
			//https://developer.chrome.com/extensions/downloads#method-download
			chrome.downloads.download({
				url: $(this).attr("href"),
				conflictAction: conflictAction
			},function (downloadId) {
				console.log("Completed download", downloadId);
			});
		});
	}
});
