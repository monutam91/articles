import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ConcatMapComponent } from './concat-map/concat-map.component';
import { SwitchMapComponent } from './switch-map/switch-map.component';
import { MergeMapComponent } from './merge-map/merge-map.component';
import { ExhaustMapComponent } from './exhaust-map/exhaust-map.component';

@NgModule({
  declarations: [
    AppComponent,
    ConcatMapComponent,
    SwitchMapComponent,
    MergeMapComponent,
    ExhaustMapComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
