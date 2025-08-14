import { bootstrapApplication } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { provideRouter, Routes } from '@angular/router';
import { GalleryComponent } from './app/components/gallery.component';
import { OptionsComponent } from './app/components/options.component';
import { HistoryComponent } from './app/components/history.component';
import { AppComponent } from './app/app.component';

const routes: Routes = [
	{ path: 'gallery', component: GalleryComponent },
	{ path: 'options', component: OptionsComponent },
	{ path: 'history', component: HistoryComponent },
	{ path: '', redirectTo: '/gallery', pathMatch: 'full' },
	{ path: '**', redirectTo: '/gallery' },
];

bootstrapApplication(AppComponent, {
	providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }, provideRouter(routes)],
}).catch((err) => console.error(err));
