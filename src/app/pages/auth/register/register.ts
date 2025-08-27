// register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

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
      this.http.post(`${environment.backendUrl}api/register`, registerData)
        .subscribe({
          next: (res: any) => {
            console.log('Registro exitoso', res);
            this.submitSuccess = res.message || 'Usuario registrado exitosamente';
            this.isSubmitting = false;
            
            // Store user data temporarily (without token since verification is required)
            if (res.user) {
              localStorage.setItem('tempUserData', JSON.stringify(res.user));
            }
            
            // Redirect to register-success page after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/register-success']);
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

  goToPage(pageName:string){
    this.router.navigate([`${pageName}`]);
  }
}
