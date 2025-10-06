import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/components/dashboard-layout/dashboard-layout';
import { Home } from './home/home';
import { NewScanComponent } from './new-scan/new-scan';
import { ScanProgressComponent } from './scan-progress/scan-progress';
import { MyScansComponent } from './my-scans/my-scans';
import { ScanReportComponent } from './scan-report/scan-report';
import { VulnerabilityDetailsComponent } from './vulnerability-details/vulnerability-details';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: Home }, // ruta por defecto del módulo dashboard
      { path: 'new-scan', component: NewScanComponent },
      { path: 'scan-progress', component: ScanProgressComponent },
      { path: 'scans', component: MyScansComponent },
      { path: 'scans/:id/report', component: ScanReportComponent },
      { path: 'scans/:scanId/vulnerability/:vulnId', component: VulnerabilityDetailsComponent },
      { path: 'theory', component: Home },
      { path: 'scoreboard', component: Home },
      { path: 'account', component: Home }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
