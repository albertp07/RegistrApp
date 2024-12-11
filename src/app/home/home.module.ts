import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { QRCodeModule } from 'angularx-qrcode';
import { QrCodeModule } from 'ng-qrcode';



@NgModule({
  
  imports: [
    
    IonicModule.forRoot(),
    FormsModule, 
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    QRCodeModule,
    QrCodeModule
  ], bootstrap: [HomePage],
  declarations: [HomePage]
})
export class HomePageModule {}
export class AppModule {}
