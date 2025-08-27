import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { RegisterSuccessComponent } from './pages/auth/register-success/register-success';
import { VerifySuccessComponent } from './pages/auth/verify-success/verify-success';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./pages/landing/landing-module').then(m => m.LandingModule) },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register-success', component: RegisterSuccessComponent },
    { path: 'verify-success', component: VerifySuccessComponent }
  ];  
