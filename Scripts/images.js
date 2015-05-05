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

	var i, applicationName, url, image, brokenImagesCount, loaded, total, resizeOn, showHiddenImages, conflictAction, currentUrl, dialogTemplate, downloadDialog, templateData, saveDialog, showViewer, $currentSelectedImage, $brokenLinkStyles;

	function l18nify(name, base) {
		return chrome.i18n.getMessage((base === "" ? base : "Images_") + name);
	}

	(function () {
		var
			pair = "",
			linkData,
			itemTemplate,
			title = "",
			parsedLinks = [],
			$content = $("#content"),
			info = tmpl("info_tmpl"),
			query = window.location.search.substring(1),
			vars = query.split("&");

		total = 0;
		loaded = 0;
		resizeOn = false;
		brokenImagesCount = 0;
		showHiddenImages = false;
		conflictAction: "uniquify";
		applicationName = l18nify("ManifestName", "");
		$brokenLinkStyles = $("#brokenLinkStyles")[0];
		image = $('<img src="/Images/128x128.png" />');

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
			document.title = applicationName + " - " + title;
			$("p.fuskUrl").html(title);

			parsedLinks = Fuskr.GetLinks(url);

			templateData = {
				Link: url,
				Position: "top",
				ManifestName: applicationName,
				Images: l18nify("Images"),
				Loaded: l18nify("Loaded"),
				Failed: l18nify("Failed"),
				DownloadImages: l18nify("DownloadImages"),
				SaveFusk: l18nify("SaveFusk"),
				ResizeImagesToFullWidth: l18nify("ResizeImagesToFullWidth"),
				ResizeImagesToFitOnPage: l18nify("ResizeImagesToFitOnPage"),
				ToggleBrokenImages: l18nify("ToggleBrokenImages"),
				RemoveBrokenImages: l18nify("RemoveBrokenImages"),
				ShowImagesInViewer: l18nify("ShowImagesInViewer")
			};

			$content.before(info(templateData));
			templateData.Position = "bottom";
			$content.after(info(templateData));

			templateData = {
				DownloadTitle: l18nify("DownloadDialog_Title"),
				Unique: l18nify("DownloadDialog_Unique"),
				UniqueInfo: l18nify("DownloadDialog_UniqueInfo"),
				UniqueInfoFilename: l18nify("DownloadDialog_UniqueInfoFilename"),
				Overwrite: l18nify("DownloadDialog_Overwrite"),
				OverwriteInfo: l18nify("DownloadDialog_OverwriteInfo"),
				Prompt: l18nify("DownloadDialog_Prompt"),
				PromptInfo: l18nify("DownloadDialog_PromptInfo"),
				ConflictQuestion: l18nify("DownloadDialog_ConflictQuestion"),
				SaveTitle: l18nify("SaveDialog_Title"),
				SaveQuestion: l18nify("SaveDialog_Question")
			};
			dialogTemplate = tmpl("dialogs");
			$content.after(dialogTemplate(templateData));

			$("input#saveName").val(url);
		} else {
			//Throw an error because we don't have a valid url.
		}
		total = parsedLinks.length;

		$("div.info span.total").html(total);

		linkData = $.map(parsedLinks, function (item, i) {

			return {
				Index : i,
				Link : item,
				Total : parsedLinks.length,
				ShowPreviousImageLink: i === 0 ? "hide" : "",
				LinkTitle: l18nify("ClickToOpenInNewTab"),
				ClickForNextPicture: l18nify("ClickForNextPicture"),
				NextImage: i > (parsedLinks.length - 1) ? "hide" : "",
				TopName: l18nify("Top"),
				TopTitle: l18nify("GoToTop"),
				BottomName: l18nify("Bottom"),
				BottomTitle: l18nify("GoToBottom"),
				LinkTitle: l18nify("ClickToOpenInNewTab"),
				PreviousImageTitle: l18nify("PreviousImageTitle"),
				NextImageTitle: l18nify("NextImageTitle")
			};
		});

		$content.empty();

		//Build item template.
		itemTemplate = tmpl("item_tmpl");
		for (i = 0; i < linkData.length; i++) {
			$content.append(itemTemplate(linkData[i]));
		}
	}());

	//Start the images hidden and show as each one loads.
	$("div#content img.fuskImage")
		.load(function () {
			$("div.info span.loaded").html(++loaded);
			$(this).parents("div.wrap").removeClass("hide").addClass("loaded");
			checkForCompletion();
		})
		.error(function () {
			brokenImagesCount++;
			$(this).closest(".wrap").addClass("error");
			$("div.info span.broken").html(brokenImagesCount);
			checkForCompletion();
		});

	//Get the users current option regarding showing images in their full resolution or scaling them to the current window size.
	$("a.resizeImages").click(function () {
		resizeOn = !resizeOn;

		if(resizeOn) {
			$("div.wrap img").css("width","100%");
			$(this).text(l18nify("ResizeImagesToFullWidth"));
		} else {
			$("div.wrap img").css("width","");
			$(this).text(l18nify("ResizeImagesToFitOnPage"));
		}
		return false;
	});

	$("a.showViewer, .viewerItem a").click(function (e) {
		e.preventDefault();
		toggleViewer();
	});

	$("a.toggleBrokenLinks").click(function (e) {
		e.preventDefault();
		showHiddenImages = !showHiddenImages;
		//$(this).find("span.showHide").html(!$brokenLinkStyles.disabled ? "Hide" : "Show");
		$brokenLinkStyles.disabled = !$brokenLinkStyles.disabled;
		return false;
	});

	$("a.removeBrokenImages").click(function (e) {
		e.preventDefault();

		$("div#content > div.error").remove();

		$(".brokenImageLinks").remove();
	});

	$("a.downloadImages").click(function (e) {
		e.preventDefault();

		downloadDialog = $("#download-form").dialog({
			autoOpen: false,
			height: 270,
			width: 550,
			modal: true,
			buttons: {
				Cancel: function () {
					$("#download-form form")[0].reset();
					downloadDialog.dialog("close");
				},
				Download: function () {
					conflictAction = $("#download-form form select#conflictResolution").val();
					downloadDialog.dialog("close");
					downloadAll();
				}
			},
			close: function () {
				$("#download-form form")[0].reset();
			}
		});

		downloadDialog.dialog("open");
	});

	$("a.previousImage").click(function (e) {
		e.preventDefault();
		scrollTo($(this), -1);
	});

	$("a.nextImage").click(function (e) {
		e.preventDefault();
		scrollTo($(this), 1);
	});

	// Hook into the Left/Right keys. This is down even if the viewer is not shown
	// so that the current viewed item is synced
	$(document).keydown(function (e) {
	    switch(e.which) {
	        case 27: // escape
				toggleViewer();
	        break;

	        case 37: // left
				getCurrentSelectedImage();
	        	scrollTo($currentSelectedImage, -1);
	        break;

	        case 39: // right
				getCurrentSelectedImage();
	        	scrollTo($currentSelectedImage, 1);
	        break;

	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	$("a.saveFusk").click(function (e) {
		e.preventDefault();

		saveDialog = $("#save-form").dialog({
			autoOpen: false,
			height: 270,
			width: 550,
			modal: true,
			buttons: {
				Cancel: function () {
					saveDialog.dialog("close");
				},
				Save: function () {
					saveFusk();
					saveDialog.dialog("close");
				}
			}
		});

		saveDialog.dialog("open");
		$("#saveName").select();
	});

	function toggleViewer () {
		// First view
		getCurrentSelectedImage();

		showViewer = !showViewer;
    	$("#viewer").toggle(showViewer);
	}

	function saveFusk () {
		var alreadySaved, savedFusksOption, name;
		name = $("#saveName").val();
		savedFusksOption = localStorage.getItem("savedFusks");

		if(savedFusksOption == null || savedFusksOption == "" || savedFusksOption === '\"[]\"') {
			savedFusksOption = [{name: name, url: url}];
		} else {
			savedFusksOption = JSON.parse(savedFusksOption);
		}

		alreadySaved = false;
		for(i = 0; i < savedFusksOption.length; i++) {
			if (name === savedFusksOption[i].name) {
				alreadySaved = true;
				savedFusksOption[i].url = url;
				break;
			}
		}

		if(alreadySaved === false) {
			savedFusksOption.push({name: name, url: url });
		}

		localStorage.setItem("savedFusks", JSON.stringify(savedFusksOption));
	}

	function getCurrentSelectedImage() {
		if (!$currentSelectedImage && $("div.loaded .fuskImage").length) {
			$currentSelectedImage = $("div.loaded .fuskImage:first");
			setCurrentImageInViewer($currentSelectedImage, 1);
		}
	}

	function scrollTo(element, direction) {
		var offset, parent, elementSelector;
		offset = 0;
		parent = element.parents("div.wrap");
		elementSelector = showHiddenImages ? "div.wrap" : "div.loaded";

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
			$("p.fuskTotals").append(" " + l18nify("Done"));
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
			});
		});
	}

	function setCurrentImageInViewer($currentImage) {
		// There is no element (we've reached an end)
		if($currentImage.length == 0) return;

		$currentSelectedImage = $currentImage;

		// get img (if it exists + was loaded)
		var elementSelector = showHiddenImages ? "div.wrap" : "div.loaded";

		var parent = $currentImage.parents("div.wrap");

		var img = $currentImage[0];
		var prev_img = parent.prevAll(elementSelector).first().find(".fuskImage")[0];
		var next_img = parent.nextAll(elementSelector).first().find(".fuskImage")[0];

		$(".viewerItem.current a").css("background-image", "url(" + (img && img.src) +")");
		if (prev_img) {
			$(".viewerItem a.previousImage").css("background-image", "url(" + (prev_img && prev_img.src) +")");
		}
		if(next_img) {
			$(".viewerItem a.nextImage").css("background-image", "url(" + (next_img && next_img.src) +")");
		}
	}
});
