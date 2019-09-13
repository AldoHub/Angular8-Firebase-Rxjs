import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//firebase
import { AngularFireModule } from '@angular/fire'; // AngularFire module
import { AngularFirestoreModule } from '@angular/fire/firestore';// Firestore module
import { AngularFireStorageModule, StorageBucket } from '@angular/fire/storage'; //FireStorage and Bucket
//environment
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from './app-routing.module';



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebase),
    AppRoutingModule,
  ],
  providers: [{ provide: StorageBucket, useValue: "gs://angular8firebase-28b9e.appspot.com"}],
  bootstrap: [AppComponent]
})
export class AppModule { }
