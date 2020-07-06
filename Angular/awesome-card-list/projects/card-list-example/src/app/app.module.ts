import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { GriffCardModule } from '@griff/card-list';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, GriffCardModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
