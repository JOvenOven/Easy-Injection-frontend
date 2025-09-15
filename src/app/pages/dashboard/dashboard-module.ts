import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Home } from './home/home';
import { DashboardLayoutComponent } from '../../shared/components/dashboard-layout/dashboard-layout';

import { DashboardRoutingModule } from './dashboard-routing-module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    Home,
    DashboardLayoutComponent
  ]
})
export class DashboardModule { }
