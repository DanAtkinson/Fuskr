// Core Fuskr functionality - standalone for service worker
// This file contains the essential Fuskr logic without Angular dependencies

const FuskrCore = (function() {
	'use strict';

	const groupRegex = /\{\d+\}/;
	const numericRegex = /^(.*?)\[(\d+)-(\d+)\](.*)$/;
	const alphabeticRegex = /^(.*?)\[(\w)-(\w)\](.*)$/;

	function padString(number, stringLength, padding) {
	let numStr = number.toString();
	if (!padding) {
		return numStr;
	}

	while (numStr.length < stringLength) {
		numStr = padding + numStr;
	}

	return numStr;
	}

	function getAlphabeticalUrls(prefix, suffix, startString, endString, groupNumber) {
	const retUrls = [];
	let startNumber = convertCharToInt(startString);
	const endNumber = convertCharToInt(endString);

	while (startNumber <= endNumber) {
		const thisNumString = convertIntToChar(startNumber);
		let link = prefix + thisNumString + suffix;

		if (groupRegex.test(link)) {
		link = link.replace(new RegExp('\\{' + groupNumber + '\\}', 'g'), thisNumString);
		}

		if (isFuskable(link)) {
		const links = getLinks(link, groupNumber + 1);
		retUrls.push(...links);
		} else {
		retUrls.push(link);
		}

		startNumber += 1;
	}

	return retUrls;
	}

	function getNumericUrls(prefix, suffix, startNumString, endNumString, groupNumber) {
	const retUrls = [];
	let startNumber = parseInt(startNumString, 10);
	const endNumber = parseInt(endNumString, 10);
	const paddedLength = startNumString.length;

	while (startNumber <= endNumber) {
		const thisNumString = padString(startNumber, paddedLength, '0');
		let link = prefix + thisNumString + suffix;

		if (groupRegex.test(link)) {
		link = link.replace(new RegExp('\\{' + groupNumber + '\\}', 'g'), thisNumString);
		}

		if (isFuskable(link)) {
		const links = getLinks(link, groupNumber + 1);
		retUrls.push(...links);
		} else {
		retUrls.push(link);
		}

		startNumber += 1;
	}

	return retUrls;
	}

	function convertIntToChar(i) {
	return String.fromCharCode(i);
	}

	function convertCharToInt(a) {
	return a.charCodeAt(0);
	}

	function isAlphabetical(url) {
	return alphabeticRegex.test(url);
	}

	function isNumeric(url) {
	return numericRegex.test(url);
	}

	function isFuskable(url) {
	return numericRegex.test(url) || alphabeticRegex.test(url);
	}

	function getLinks(url, groupNumber = 0) {
	const links = [];

	if (!isFuskable(url)) {
		return links;
	}

	if (isNumeric(url)) {
		const matches = numericRegex.exec(url);
		if (matches) {
		return getNumericUrls(matches[1], matches[4], matches[2], matches[3], groupNumber);
		}
	} else if (isAlphabetical(url)) {
		const matches = alphabeticRegex.exec(url);
		if (matches) {
		return getAlphabeticalUrls(matches[1], matches[4], matches[2], matches[3], groupNumber);
		}
	}

	return links;
	}

	function createFuskUrl(url, count, direction) {
	const findDigitsRegexp = /^(.*?)(\d+)([^\d]*)$/;
	const digitsCheck = findDigitsRegexp.exec(url);

	if (!digitsCheck) {
		return url;
	}

	const begin = digitsCheck[1];
	const number = digitsCheck[2];
	const end = digitsCheck[3];

	const originalNum = parseInt(number, 10);
	let firstNum = originalNum;
	let lastNum = originalNum;

	if (direction === 0) {
		firstNum -= count;
		lastNum += count;
	} else if (direction === -1) {
		firstNum -= count;
	} else if (direction === 1) {
		lastNum += count;
	}

	firstNum = Math.max(0, firstNum);
	lastNum = Math.max(0, lastNum);

	let firstNumStr = firstNum.toString();
	let lastNumStr = lastNum.toString();

	while (firstNumStr.length < number.length) {
		firstNumStr = '0' + firstNumStr;
	}

	while (lastNumStr.length < firstNumStr.length) {
		lastNumStr = '0' + lastNumStr;
	}

	return begin + '[' + firstNumStr + '-' + lastNumStr + ']' + end;
	}

	function getImageFilename(url) {
	if (typeof url === 'undefined' || url === '') {
		return '';
	}

	return url.substring(url.lastIndexOf('/') + 1);
	}

	// Public API
	return {
	convertIntToChar,
	convertCharToInt,
	isAlphabetical,
	isNumeric,
	isFuskable,
	getLinks,
	createFuskUrl,
	getImageFilename
	};
})();

// Make available globally for service worker
if (typeof self !== 'undefined') {
	self.FuskrCore = FuskrCore;
}
