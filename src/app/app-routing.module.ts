import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './components/gallery.component';
import { OptionsComponent } from './components/options.component';

const routes: Routes = [
	{ path: 'gallery', component: GalleryComponent },
	{ path: 'options', component: OptionsComponent },
	{ path: '', redirectTo: '/gallery', pathMatch: 'full' },
	{ path: '**', redirectTo: '/gallery' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule { }
