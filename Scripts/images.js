(function() {
	var brokenImagesCount = 0,
		loaded = 0,
		resizeOn = false,
		showHiddenImages = false;

	$(function() {

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

		document.title = "Fuskr - " + currentUrl;

		$("p.fuskUrl").html(currentUrl);

		var parsedLinks = Fuskr.GetLinks(currentUrl);

		var linkData = $.map(parsedLinks, function(item,i){
			return { "Index" : i, "Link" : item, "Total" : parsedLinks.length };
		});

		$("div.info span.total").html(linkData.length);

		console.log(JSON.stringify(linkData));
		$("#content").html($("#imageTemplate").render(linkData));

		//Start the images hidden and show as each one loads.
		$("div#content img.fuskImage").load(function () {
			$("div.info span.loaded").html(loaded++);
			$(this).parents("div.wrap").removeClass("hide").addClass("loaded");
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

		$("a.resizeImage").click(function(e) {
			e.preventDefault();
			if($(this).hasClass("resized")) {
				$(this).removeClass("resized");
				$(this).parent().find("img").css("width","");
			} else {
				$(this).addClass("resized").parent().find("img").css("width","100%");
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

		$("a.previousImage").click(function(e){
			e.preventDefault();
			scrollTo($(this), -1);
		});

		$("a.nextImage").click(function(e){
			e.preventDefault();
			scrollTo($(this), 1);
		});

		function scrollTo(element, direction){
			var offset = 0;
			var parent = element.parents("div.wrap");
			var elementSelector = showHiddenImages ? "div.wrap" : "div.loaded";

			//get the offset of the target anchor
			if(direction === 1){
				offset = parent.nextAll(elementSelector).first().offset();
			}else{
				offset = parent.prevAll(elementSelector).first().offset();
			}

			if(offset != null){
				//goto that anchor by setting the body scroll top to anchor top
				$('html, body').animate({scrollTop:offset.top}, 500);
			}
		}

		$("img.fuskImage").error(function() {
			brokenImagesCount++;
			$(this).closest(".wrap").addClass("error");
			$("div.info span.broken").html(brokenImagesCount);
		});
	});
})();
