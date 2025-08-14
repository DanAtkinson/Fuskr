// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import './test-setup';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Import all spec files directly
import '@services/fuskr.service.spec';
import '@services/chrome.service.spec';
import '@components/gallery.component.spec';
import '@components/options.component.spec';
