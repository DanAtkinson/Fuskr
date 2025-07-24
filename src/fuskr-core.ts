// Core Fuskr functionality - standalone for service worker
// This file contains the essential Fuskr logic without Angular dependencies

export interface FuskResult {
	urls: string[];
	originalUrl: string;
}

export class FuskrCore {
	private static readonly groupRegex = /\{\d+\}/;
	private static readonly numericRegex = /^(.*?)\[(\d+)-(\d+)\](.*)$/;
	private static readonly alphabeticRegex = /^(.*?)\[(\w)-(\w)\](.*)$/;

	private static padString(number: number, stringLength: number, padding?: string): string {
		let numStr = number.toString();
		if (!padding) {
			return numStr;
		}

		while (numStr.length < stringLength) {
			numStr = padding + numStr;
		}

		return numStr;
	}

	private static getAlphabeticalUrls(
		prefix: string,
		suffix: string,
		startString: string,
		endString: string,
		groupNumber: number
	): string[] {
		const retUrls: string[] = [];
		let startNumber = this.convertCharToInt(startString);
		const endNumber = this.convertCharToInt(endString);

		while (startNumber <= endNumber) {
			const thisNumString = this.convertIntToChar(startNumber);
			let link = prefix + thisNumString + suffix;

			if (this.groupRegex.test(link)) {
				link = link.replace(new RegExp('\\{' + groupNumber + '\\}', 'g'), thisNumString);
			}

			if (this.isFuskable(link)) {
				const links = this.getLinks(link, groupNumber + 1);
				retUrls.push(...links);
			} else {
				retUrls.push(link);
			}

			startNumber += 1;
		}

		return retUrls;
	}

	private static getNumericUrls(
		prefix: string,
		suffix: string,
		startNumString: string,
		endNumString: string,
		groupNumber: number
	): string[] {
		const retUrls: string[] = [];
		let startNumber = parseInt(startNumString, 10);
		const endNumber = parseInt(endNumString, 10);
		const stringLength = startNumString.length;
		const padding = startNumString.length > 1 && startNumString.charAt(0) === '0' ? '0' : undefined;

		while (startNumber <= endNumber) {
			const thisNumString = this.padString(startNumber, stringLength, padding);
			let link = prefix + thisNumString + suffix;

			if (this.groupRegex.test(link)) {
				link = link.replace(new RegExp('\\{' + groupNumber + '\\}', 'g'), thisNumString);
			}

			if (this.isFuskable(link)) {
				const links = this.getLinks(link, groupNumber + 1);
				retUrls.push(...links);
			} else {
				retUrls.push(link);
			}

			startNumber += 1;
		}

		return retUrls;
	}

	private static convertCharToInt(char: string): number {
		return char.charCodeAt(0);
	}

	private static convertIntToChar(int: number): string {
		return String.fromCharCode(int);
	}

	public static isFuskable(url: string): boolean {
		return this.numericRegex.test(url) || this.alphabeticRegex.test(url);
	}

	public static getLinks(url: string, groupNumber: number = 0): string[] {
		if (!url) return [];

		const numericMatch = url.match(this.numericRegex);
		if (numericMatch) {
			const [, prefix, startNum, endNum, suffix] = numericMatch;
			return this.getNumericUrls(prefix, suffix, startNum, endNum, groupNumber);
		}

		const alphabeticMatch = url.match(this.alphabeticRegex);
		if (alphabeticMatch) {
			const [, prefix, startChar, endChar, suffix] = alphabeticMatch;
			return this.getAlphabeticalUrls(prefix, suffix, startChar, endChar, groupNumber);
		}

		return [url];
	}

	public static generateImageGallery(originalUrl: string): FuskResult {
		if (!originalUrl?.trim()) {
			throw new Error('URL cannot be empty');
		}

		let processedUrl = originalUrl.trim();
		
		// Convert common patterns to bracket notation
		processedUrl = this.convertToBracketNotation(processedUrl);

		const urls = this.getLinks(processedUrl);
		
		return {
			urls,
			originalUrl: processedUrl
		};
	}

	private static convertToBracketNotation(url: string): string {
		// Convert patterns like image01.jpg to image[01-99].jpg if not already in bracket notation
		if (!this.isFuskable(url)) {
			// Look for numbered patterns that could be converted
			const numberPattern = /^(.*?)(\d+)(\.[^.]*)?$/;
			const match = url.match(numberPattern);
			
			if (match) {
				const [, prefix, number, extension = ''] = match;
				const numLength = number.length;
				const startNum = number;
				// Default range suggestion
				const endNum = number.padStart(numLength, '0').replace(/\d$/, '9');
				return `${prefix}[${startNum}-${endNum}]${extension}`;
			}
		}
		
		return url;
	}

	public static countPotentialUrls(url: string): number {
		if (!this.isFuskable(url)) {
			return 1;
		}

		const urls = this.getLinks(url);
		return urls.length;
	}
}

// For backward compatibility with the old global function style
declare global {
	interface Window {
		FuskrCore: typeof FuskrCore;
	}
}

if (typeof window !== 'undefined') {
	window.FuskrCore = FuskrCore;
}
