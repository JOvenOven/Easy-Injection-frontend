import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Home } from './home/home';

import { DashboardRoutingModule } from './dashboard-routing-module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    Home
  ]
})
export class DashboardModule { }
