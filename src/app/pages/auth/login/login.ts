// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    this.submitError = null;

    if (this.loginForm.valid) {
      this.isSubmitting = true;

      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      // API endpoint para login
      this.http.post(`${environment.backendUrl}api/login`, loginData)
        .subscribe({
          next: (res: any) => {
            console.log('Login exitoso', res);
            this.isSubmitting = false;

            // Guardar token y/o usuario en localStorage
            if (res.token) {
              localStorage.setItem('authToken', res.token);
            }
            if (res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
            }

            // Redirigir al dashboard (o la página principal)
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Error en login', err);
            this.submitError = err.error?.error || 'Credenciales incorrectas o servidor no disponible.';
            this.isSubmitting = false;
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
      console.log('Formulario inválido');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
