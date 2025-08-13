import { Injectable } from '@angular/core';

export interface FuskrResult {
  urls: string[];
  originalUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class FuskrService {
  // Public methods (alphabetically)
  convertCharToInt = (a: string): number => a.charCodeAt(0);
  convertIntToChar = (i: number): string => String.fromCharCode(i);

  countPotentialUrls(url: string, count: number = 10): number {
    let processedUrl = url;

    // If the URL doesn't already contain brackets, convert it to a bracketed pattern
    if (!this.isFuskable(url)) {
      // Try to create a fusk URL with a default count
      processedUrl = this.createFuskUrl(url, count, 0);
    }

    if (!this.isFuskable(processedUrl)) {
      return 0;
    }

    // Count all bracket patterns in the URL, not just the first one
    let totalCount = 1; // Start with 1 as we'll multiply
    let remainingUrl = processedUrl;

    // Keep finding bracket patterns until none remain
    while (this.isFuskable(remainingUrl)) {
      let patternCount = 0;

      if (this.isNumeric(remainingUrl)) {
        const matches = this.numericRegex.exec(remainingUrl);
        if (matches) {
          const start = parseInt(matches[2], 10);
          const end = parseInt(matches[3], 10);
          patternCount = Math.abs(end - start) + 1;
          // Remove this pattern and continue checking for more
          remainingUrl = matches[1] + 'X' + matches[4]; // Replace with X to avoid re-matching
        }
      } else if (this.isAlphabetical(remainingUrl)) {
        const matches = this.alphabeticRegex.exec(remainingUrl);
        if (matches) {
          const start = this.convertCharToInt(matches[2]);
          const end = this.convertCharToInt(matches[3]);
          patternCount = Math.abs(end - start) + 1;
          // Remove this pattern and continue checking for more
          remainingUrl = matches[1] + 'X' + matches[4]; // Replace with X to avoid re-matching
        }
      }

      if (patternCount > 0) {
        totalCount *= patternCount;
      } else {
        break; // No more patterns found
      }
    }

    return totalCount;
  }

  createFuskUrl(url: string, count: number, direction: number): string {
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

  generateImageGallery(url: string, count: number = 10): FuskrResult {
    let processedUrl = url;

    // If the URL doesn't already contain brackets, convert it to a bracketed pattern
    if (!this.isFuskable(url)) {
      // Try to create a fusk URL with a default count
      processedUrl = this.createFuskUrl(url, count, 0);
    }

    const urls = this.getLinks(processedUrl);
    return {
      urls,
      originalUrl: processedUrl, // Return the bracketed version
    };
  }

  getImageFilename(url: string): string {
    if (typeof url === 'undefined' || url === '') {
      return '';
    }

    return url.substring(url.lastIndexOf('/') + 1);
  }

  getLinks(url: string, groupNumber: number = 0): string[] {
    const links: string[] = [];

    if (!url || typeof url !== 'string' || !this.isFuskable(url)) {
      return links;
    }

    if (this.isNumeric(url)) {
      const matches = this.numericRegex.exec(url);
      if (matches) {
        return this.getNumericUrls(matches[1], matches[4], matches[2], matches[3], groupNumber);
      }
    } else if (this.isAlphabetical(url)) {
      const matches = this.alphabeticRegex.exec(url);
      if (matches) {
        return this.getAlphabeticalUrls(matches[1], matches[4], matches[2], matches[3], groupNumber);
      }
    }

    return links;
  }

  isAlphabetical = (url: string): boolean => this.alphabeticRegex.test(url);
  isFuskable(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return this.numericRegex.test(url) || this.alphabeticRegex.test(url);
  }

  isNumeric = (url: string): boolean => this.numericRegex.test(url);

  // Private properties (alphabetically)
  private readonly alphabeticRegex = /^(.*?)\[(\w)-(\w)\](.*)$/;
  private readonly groupRegex = /\{\d+\}/;
  private readonly numericRegex = /^(.*?)\[(\d+)-(\d+)\](.*)$/;

  // Private methods (alphabetically)
  private getAlphabeticalUrls(
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

  private getNumericUrls(
    prefix: string,
    suffix: string,
    startNumString: string,
    endNumString: string,
    groupNumber: number
  ): string[] {
    const retUrls: string[] = [];
    let startNumber = parseInt(startNumString, 10);
    const endNumber = parseInt(endNumString, 10);
    const paddedLength = startNumString.length;

    while (startNumber <= endNumber) {
      const thisNumString = this.padString(startNumber, paddedLength, '0');
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

  private padString(number: number, stringLength: number, padding: string): string {
    let numStr = number.toString();
    if (!padding) {
      return numStr;
    }

    while (numStr.length < stringLength) {
      numStr = padding + numStr;
    }

    return numStr;
  }
}
