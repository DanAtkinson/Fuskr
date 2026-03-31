import { bootstrapApplication } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy, IMAGE_CONFIG } from '@angular/common';
import { provideRouter, Routes } from '@angular/router';

import { AppComponent } from './app/app.component';
import { GalleryComponent } from './app/components/gallery.component';
import { HelpComponent } from './app/components/help.component';
import { HistoryComponent } from './app/components/history.component';
import { OptionsComponent } from './app/components/options.component';

const routes: Routes = [
	{ path: 'gallery', component: GalleryComponent },
	{ path: 'help', component: HelpComponent },
	{ path: 'history', component: HistoryComponent },
	{ path: 'options', component: OptionsComponent },
	{ path: '', redirectTo: '/gallery', pathMatch: 'full' },
	{ path: '**', redirectTo: '/gallery' },
];

bootstrapApplication(AppComponent, {
	providers: [
		{ provide: LocationStrategy, useClass: HashLocationStrategy },
		provideRouter(routes),
		{
			provide: IMAGE_CONFIG,
			useValue: {
				// External images shown at thumbnail sizes will always have larger intrinsic
				// dimensions than their rendered size — suppressing this warning is correct
				// for a gallery extension where source image dimensions cannot be controlled.
				disableImageSizeWarning: true,
			},
		},
	],
}).catch((err) => console.error(err));
