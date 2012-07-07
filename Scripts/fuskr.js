;var Fuskr = (function(ret) {
	var regex = /^(.*?)\[(\d+)\-(\d+)\](.*)$/;
	var groupRegex = /\{\d+\}/;

	function PadString(number, stringLength, padding) {
		var numStr = "" + number;
		if(!padding) return numStr;

		while(numStr.length < stringLength) {
			numStr = padding + numStr;
		}

		return numStr;
	}

	function GetUrls(prefix, suffix, startNumString, endNumString, groupNumber) {
		var retUrls = [],
			startNumber = parseInt(startNumString, 10),
			endNumber = parseInt(endNumString, 10),
			paddedLength = startNumString.length;

			while(startNumber <= endNumber) {
			var thisNumString = PadString(startNumber, paddedLength, "0"),
				link = prefix + thisNumString + suffix;

			if(groupRegex.test(link)) {
				link = link.replace(new RegExp("\\\{"+groupNumber+"\\\}", 'g'), thisNumString);
			}

			if(ret.IsFuskable(link)) {
				var links = ret.GetLinks(link, groupNumber+1);
				for(var i = 0; i < links.length; i++) {
					retUrls.push(links[i]);
				}
			} else {
				retUrls.push(link);
			}

			startNumber++;
		}

		return retUrls;
	}

	ret.ConvertIntToChar = function(i) { 
		return String.fromCharCode(i);
	}

	ret.ConvertCharToInt = function(a) { 
		return a.charCodeAt();
	}	

	ret.IsFuskable = function(url) {
		return regex.test(url);
	};

	ret.GetLinks = function(url, groupNumber) {
		var links = [];
		groupNumber = groupNumber || 0;

		if(ret.IsFuskable(url)) {
			var matches = regex.exec(url);
			links = GetUrls(matches[1],matches[4], matches[2], matches[3],groupNumber);
		}
		return links;
	}

	return ret;
}(Fuskr || {}));