var Fuskr = (function (ret) {
	'use strict';

	var groupRegex = /\{\d+\}/,
		numericRegex = /^(.*?)\[(\d+)-(\d+)\](.*)$/,
		alphabeticRegex = /^(.*?)\[(\w)-(\w)\](.*)$/;

	function padString(number, stringLength, padding) {
		var numStr = number.toString();
		if (!padding) {
			return numStr;
		}

		while (numStr.length < stringLength) {
			numStr = padding + numStr;
		}

		return numStr;
	}

	function getAlphabeticalUrls(prefix, suffix, startString, endString, groupNumber) {
		var i,
			link,
			links,
			retUrls = [],
			thisNumString,
			startNumber = ret.ConvertCharToInt(startString),
			endNumber = ret.ConvertCharToInt(endString);

		while (startNumber <= endNumber) {
			thisNumString = ret.ConvertIntToChar(startNumber);
			link = prefix + thisNumString + suffix;

			if (groupRegex.test(link)) {
				link = link.replace(new RegExp('\\{' + groupNumber + '\\}', 'g'), thisNumString);
			}

			if (ret.IsFuskable(link)) {
				links = ret.GetLinks(link, groupNumber + 1);
				for (i = 0; i < links.length; i += 1) {
					retUrls.push(links[i]);
				}
			} else {
				retUrls.push(link);
			}

			startNumber += 1;
		}

		return retUrls;
	}

	function getNumericUrls(prefix, suffix, startNumString, endNumString, groupNumber) {
		var i,
			link,
			links,
			retUrls = [],
			thisNumString,
			startNumber = parseInt(startNumString, 10),
			endNumber = parseInt(endNumString, 10),
			paddedLength = startNumString.length;

		while (startNumber <= endNumber) {
			thisNumString = padString(startNumber, paddedLength, '0');
			link = prefix + thisNumString + suffix;

			if (groupRegex.test(link)) {
				link = link.replace(new RegExp('\\{' + groupNumber + '\\}', 'g'), thisNumString);
			}

			if (ret.IsFuskable(link)) {
				links = ret.GetLinks(link, groupNumber + 1);
				for (i = 0; i < links.length; i += 1) {
					retUrls.push(links[i]);
				}
			} else {
				retUrls.push(link);
			}

			startNumber += 1;
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

		if (!ret.IsFuskable(url)) {
			return links;
		}

		if (ret.IsNumeric(url)) {
			matches = numericRegex.exec(url);
			links = getNumericUrls(matches[1], matches[4], matches[2], matches[3], groupNumber);
		} else if (ret.IsAlphabetical(url)) {
			matches = alphabeticRegex.exec(url);
			links = getAlphabeticalUrls(matches[1], matches[4], matches[2], matches[3], groupNumber);
		}

		return links;
	};

	ret.CreateFuskUrl = function (url, count, direction) {
		var begin, number, end, firstNum, lastNum, findDigitsRegexp, digitsCheck;

		findDigitsRegexp = /^(.*?)(\d+)([^\d]*)$/;
		digitsCheck = findDigitsRegexp.exec(url);

		begin = digitsCheck[1];
		number = digitsCheck[2];
		end = digitsCheck[3];

		firstNum = parseInt(number, 10);
		lastNum = firstNum;

		if (direction === 0) {
			firstNum -= count;
			lastNum += count;
		} else if (direction === -1) {
			firstNum -= count;
		} else if (direction === 1) {
			lastNum += count;
		}

		firstNum = (firstNum < 0 ? 0 : firstNum).toString();
		lastNum = (lastNum < 0 ? 0 : lastNum).toString();

		while (firstNum.length < number.length) {
			firstNum = '0' + firstNum;
		}

		while (lastNum.length < firstNum.length) {
			lastNum = '0' + lastNum;
		}

		return begin + '[' + firstNum + '-' + lastNum + ']' + end;
	};

	ret.GetImageFilename = function (url) {
		if (typeof url === 'undefined' || url === '') {
			return '';
		}

		return url.substring(url.lastIndexOf('/') + 1);
	};

	return ret;
}(Fuskr || {}));
