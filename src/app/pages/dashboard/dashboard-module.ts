import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Home } from './home/home';
import { NewScanComponent } from './new-scan/new-scan';
import { ScanProgressComponent } from './scan-progress/scan-progress';
import { MyScansComponent } from './my-scans/my-scans';
import { DashboardLayoutComponent } from '../../shared/components/dashboard-layout/dashboard-layout';

import { DashboardRoutingModule } from './dashboard-routing-module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    Home,
    NewScanComponent,
    ScanProgressComponent,
    MyScansComponent,
    DashboardLayoutComponent
  ]
})
export class DashboardModule { }
