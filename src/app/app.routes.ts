import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/auth/register/register';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./pages/landing/landing-module').then(m => m.LandingModule) },
    { path: 'register', component: RegisterComponent }
  ];  
