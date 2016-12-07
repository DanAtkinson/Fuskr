var Fuskr = (function (ret) {
	"use strict";

	var numericRegex = /^(.*?)\[(\d+)\-(\d+)\](.*)$/,
		alphabeticRegex = /^(.*?)\[(\w)\-(\w)\](.*)$/,
		groupRegex = /\{\d+\}/;

	function PadString(number, stringLength, padding) {
		var numStr = "" + number;
		if (!padding) {
			return numStr;
		}

		while (numStr.length < stringLength) {
			numStr = padding + numStr;
		}

		return numStr;
	}

	function GetAlphabeticalUrls(prefix, suffix, startString, endString, groupNumber) {
		var i,
			link,
			links,
			thisNumString,
			retUrls = [],
			startNumber = ret.ConvertCharToInt(startString),
			endNumber = ret.ConvertCharToInt(endString);

		while (startNumber <= endNumber) {
			thisNumString = ret.ConvertIntToChar(startNumber);
			link = prefix + thisNumString + suffix;

			if (groupRegex.test(link)) {
				link = link.replace(new RegExp("\\\{".concat(groupNumber, "\\\}"), 'g'), thisNumString);
			}

			if (ret.IsFuskable(link)) {
				links = ret.GetLinks(link, groupNumber + 1);
				for (i = 0; i < links.length; i = i + 1) {
					retUrls.push(links[i]);
				}
			} else {
				retUrls.push(link);
			}

			startNumber = startNumber + 1;
		}

		return retUrls;
	}

	function GetNumericUrls(prefix, suffix, startNumString, endNumString, groupNumber) {
		var i,
			link,
			links,
			thisNumString,
			retUrls = [],
			startNumber = parseInt(startNumString, 10),
			endNumber = parseInt(endNumString, 10),
			paddedLength = startNumString.length;

		while (startNumber <= endNumber) {
			thisNumString = PadString(startNumber, paddedLength, "0");
			link = prefix + thisNumString + suffix;

			if (groupRegex.test(link)) {
				link = link.replace(new RegExp("\\\{".concat(groupNumber, "\\\}"), 'g'), thisNumString);
			}

			if (ret.IsFuskable(link)) {
				links = ret.GetLinks(link, groupNumber + 1);
				for (i = 0; i < links.length; i = i + 1) {
					retUrls.push(links[i]);
				}
			} else {
				retUrls.push(link);
			}

			startNumber = startNumber + 1;
		}

		return retUrls;
	}

	ret.ConvertIntToChar = function (i) {
		return String.fromCharCode(i);
	};

	ret.ConvertCharToInt = function (a) {
		return a.charCodeAt();
	};

	ret.IsAlphabetical = function (url) {
		return alphabeticRegex.test(url);
	};

	ret.IsNumeric = function (url) {
		return numericRegex.test(url);
	};

	ret.IsFuskable = function (url) {
		return numericRegex.test(url) || alphabeticRegex.test(url);
	};

	ret.GetLinks = function (url, groupNumber) {
		var matches, links = [];
		groupNumber = groupNumber || 0;

		if (ret.IsFuskable(url)) {
			if (ret.IsNumeric(url)) {
				matches = numericRegex.exec(url);
				links = GetNumericUrls(matches[1], matches[4], matches[2], matches[3], groupNumber);
			} else if (ret.IsAlphabetical(url)) {
				matches = alphabeticRegex.exec(url);
				links = GetAlphabeticalUrls(matches[1], matches[4], matches[2], matches[3], groupNumber);
			}
		}

		return links;
	};

	return ret;
}(Fuskr || {}));