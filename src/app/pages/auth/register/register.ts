// register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para coincidencia de contraseña
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitError = null;
    this.submitSuccess = null;
    
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      
      // Prepare data for API (remove confirmPassword and terms)
      const registerData = {
        username: this.registerForm.get('username')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value
      };

      // API endpoint for registration
      this.http.post('http://localhost:3000/api/register', registerData)
        .subscribe({
          next: (res: any) => {
            console.log('Registro exitoso', res);
            this.submitSuccess = res.message || 'Usuario registrado exitosamente';
            this.isSubmitting = false;
            
            // Store token in localStorage
            if (res.token) {
              localStorage.setItem('authToken', res.token);
              localStorage.setItem('userData', JSON.stringify(res.user));
            }
            
            // Redirect to home page after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
          },
          error: (err) => {
            console.error('Error al registrar', err);
            this.submitError = err.error?.error || 'No se pudo completar el registro. Intenta más tarde.';
            this.isSubmitting = false;
          }
        });
    } else {
      this.registerForm.markAllAsTouched(); // marca todos los campos como tocados para mostrar errores
      console.log('Formulario inválido');
    }
  }
}
