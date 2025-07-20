import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GalleryComponent } from '@components/gallery.component';
import { OptionsComponent } from '@components/options.component';

@NgModule({
	declarations: [
		AppComponent,
		GalleryComponent,
		OptionsComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule
	],
	providers: [
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	bootstrap: [
		AppComponent
	]
})
export class AppModule { }
