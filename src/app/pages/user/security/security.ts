import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './security.html',
  styleUrl: './security.scss'
})
export class SecurityComponent implements OnInit {

  // Forms
  changePasswordForm: FormGroup;

  // UI state
  changingPassword = false;
  
  // Notifications
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification = false;

  // Modal states
  showChangePasswordModal = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    // Change password form
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });

  }

  ngOnInit(): void {
  }

  passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // =========================
  // Change Password
  // =========================
  openChangePasswordModal() {
    this.showChangePasswordModal = true;
    this.changePasswordForm.reset();
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    this.changePasswordForm.reset();
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.changingPassword = true;
    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (response) => {
        this.showNotificationMessage('Contraseña cambiada exitosamente');
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.showNotificationMessage(
          error.error?.error || 'Error al cambiar la contraseña',
          'error'
        );
      },
      complete: () => {
        this.changingPassword = false;
      }
    });
  }

  // =========================
  // UI Helpers
  // =========================
  showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
  }

  hideNotification() {
    this.showNotification = false;
  }
}

