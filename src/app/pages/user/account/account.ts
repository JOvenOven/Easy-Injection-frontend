import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserService, User, SessionItem } from '../../../services/user.service';

// Remove duplicate interfaces - they're now imported from user.service

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  // User data from API
  user: User = {
    _id: '',
    username: '',
    email: '',
    fecha_registro: '',
    ultimo_login: '',
    estado_cuenta: '',
    email_verificado: false,
    perfil: {
      avatarId: 'avatar1'
    }
  };

  // Sesiones activas (mock)
  sessions: SessionItem[] = [];

  // Available avatars
  availableAvatars = [
    { id: 'avatar1', path: 'avatar1.png', name: 'Avatar 1' },
    { id: 'avatar2', path: 'avatar2.png', name: 'Avatar 2' },
    { id: 'avatar3', path: 'avatar3.png', name: 'Avatar 3' },
    { id: 'avatar4', path: 'avatar4.png', name: 'Avatar 4' },
    { id: 'avatar5', path: 'avatar5.png', name: 'Avatar 5' },
    { id: 'avatar6', path: 'avatar6.png', name: 'Avatar 6' }
  ];

  // Control de pestañas del sidebar
  activeTab: 'info' | 'security' | 'notifications' | 'help' = 'info';

  // Estados de edición
  editing = false;
  saving = false;

  // Modal states
  showPasswordModal = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  showEditProfileModal = false;
  activeEditTab: 'username' | 'avatar' = 'username';
  selectedAvatar = 'avatar1';

  // Notification states
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification = false;

  // Modal notification states
  editProfileMessage = '';
  editProfileMessageType: 'success' | 'error' = 'success';
  showEditProfileMessage = false;
  
  changePasswordMessage = '';
  changePasswordMessageType: 'success' | 'error' = 'success';
  showChangePasswordMessage = false;

  // Formularios reactivos
  editForm: FormGroup;
  changePasswordForm: FormGroup;
  changingPassword = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) {
    // Formulario para editar perfil
    this.editForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Formulario para cambiar contraseña
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/) // una min, una may, un número
      ]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSessions();
  }

  loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        this.user = response.user;
        this.selectedAvatar = this.user.perfil?.avatarId || 'avatar1';
        // Initialize form with current values
        this.editForm.patchValue({ 
          username: this.user.username, 
          email: this.user.email 
        });
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        // Fallback to mock data if API fails
        this.loadMockData();
      }
    });
  }

  loadSessions(): void {
    this.userService.getSessions().subscribe({
      next: (response) => {
        this.sessions = response.sessions;
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        // Fallback to mock data
        this.sessions = [
          { id: 's1', device: 'PC', browser: 'Chrome', location: 'Ciudad de México', lastActive: 'Activo ahora', isCurrent: true },
          { id: 's2', device: 'iPhone', browser: 'Safari', location: 'Guadalajara', lastActive: 'Hace 2 días', isCurrent: false }
        ];
      }
    });
  }

  loadMockData(): void {
    this.user = {
      _id: '1',
      username: 'usuario_ejemplo',
      email: 'usuario@ejemplo.com',
      fecha_registro: '2025-01-15',
      ultimo_login: '2025-05-20 14:30',
      estado_cuenta: 'activo',
      email_verificado: true,
      perfil: {
        avatarId: 'avatar1'
      }
      };
      this.selectedAvatar = this.user.perfil?.avatarId || 'avatar1';
      this.editForm.patchValue({ username: this.user.username, email: this.user.email });
  }

  // =========================
  // Navegación / UI helpers
  // =========================
  selectTab(tab: 'info' | 'security' | 'notifications' | 'help') {
    this.activeTab = tab;
  }

  showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
  }

  hideNotification() {
    this.showNotification = false;
  }

  // Modal notification methods
  showEditProfileNotification(message: string, type: 'success' | 'error' = 'success') {
    this.editProfileMessage = message;
    this.editProfileMessageType = type;
    this.showEditProfileMessage = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showEditProfileMessage = false;
    }, 5000);
  }

  hideEditProfileNotification() {
    this.showEditProfileMessage = false;
  }

  showChangePasswordNotification(message: string, type: 'success' | 'error' = 'success') {
    this.changePasswordMessage = message;
    this.changePasswordMessageType = type;
    this.showChangePasswordMessage = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showChangePasswordMessage = false;
    }, 5000);
  }

  hideChangePasswordNotification() {
    this.showChangePasswordMessage = false;
  }

  // Validation helper methods
  getUsernameErrorMessage(): string {
    const usernameControl = this.editForm.get('username');
    if (!usernameControl?.errors || !usernameControl.touched) {
      return '';
    }

    if (usernameControl.errors['required']) {
      return 'El nombre de usuario es obligatorio';
    }
    if (usernameControl.errors['minlength']) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (usernameControl.errors['maxlength']) {
      return 'El nombre de usuario no puede tener más de 20 caracteres';
    }
    if (usernameControl.errors['pattern']) {
      return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }
    return '';
  }

  enterEditMode() {
    this.editing = true;
    this.editForm.patchValue({
      username: this.user.username,
      email: this.user.email
    });
  }

  cancelEdit() {
    this.editing = false;
    this.editForm.reset({ username: this.user.username, email: this.user.email });
  }

  // =========================
  // Guardar perfil
  // =========================
  saveProfile() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload = {
      username: this.editForm.value.username,
      email: this.editForm.value.email,
      avatarId: this.selectedAvatar,
    };

    this.userService.updateProfile(payload).subscribe({
      next: (response) => {
        // Actualizar datos en UI
        this.user = response.user;
        this.editing = false;

        // Notificación de éxito
        this.showEditProfileNotification('Perfil actualizado exitosamente');

        // Cerrar modal después de un pequeño delay
        setTimeout(() => {
          this.closeEditProfileModal();
        }, 2000);
      },

      error: (error) => {
        console.error('Error al guardar perfil', error);

        this.saving = false;
        this.showEditProfileNotification(
          'Error al actualizar el perfil: ' + (error.error?.error || 'Error desconocido'),
          'error'
        );
      },

      complete: () => {
        this.saving = false;
      },
    });
  }

  // =========================
  // Modal control methods
  // =========================
  openChangePasswordModal() {
    this.showPasswordModal = true;
    this.showChangePasswordMessage = false; // Clear any previous messages
    this.changePasswordForm.reset();
  }

  closeChangePasswordModal() {
    this.showPasswordModal = false;
    this.changePasswordForm.reset();
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  openEditProfileModal() {
    this.showEditProfileModal = true;
    this.activeEditTab = 'username';
    this.selectedAvatar = this.user.perfil?.avatarId || 'avatar1';
    this.showEditProfileMessage = false; // Clear any previous messages
    this.editForm.patchValue({
      username: this.user.username,
      email: this.user.email
    });
  }

  closeEditProfileModal() {
    this.showEditProfileModal = false;
    this.editForm.reset();
    this.selectedAvatar = 'avatar1';
  }

  setActiveEditTab(tab: 'username' | 'avatar') {
    this.activeEditTab = tab;
  }

  selectAvatar(avatarId: string) {
    this.selectedAvatar = avatarId;
  }

  getAvatarName(avatarId: string): string {
    const avatar = this.availableAvatars.find(a => a.id === avatarId);
    return avatar ? avatar.name : 'Avatar 1';
  }

  getAvatarPath(avatarId: string): string {
    const avatar = this.availableAvatars.find(a => a.id === avatarId);
    return avatar ? avatar.path : 'avatar1.png';
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  // =========================
  // Cambio de contraseña
  // =========================
  passwordsMatchValidator(group: AbstractControl) {
    const a = group.get('newPassword')?.value;
    const b = group.get('confirmNewPassword')?.value;
    return a === b ? null : { passwordMismatch: true };
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
        // Reset form and notify success
        this.changePasswordForm.reset();
        this.showChangePasswordNotification('Contraseña cambiada correctamente');
        // Close modal after a short delay
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error al cambiar contraseña', error);
        this.changingPassword = false;
        this.showChangePasswordNotification('Error al cambiar la contraseña: ' + (error.error?.error || 'Error desconocido'), 'error');
      },
      complete: () => {
        this.changingPassword = false;
      }
    });
  }

  // =========================
  // Sesiones
  // =========================
  closeSession(sessionId: string) {
    this.userService.closeSession(sessionId).subscribe({
      next: (response) => {
        // Remove session from UI
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        this.showNotificationMessage('Sesión cerrada exitosamente');
      },
      error: (error) => {
        console.error('Error cerrando sesión', error);
        this.showNotificationMessage('Error al cerrar la sesión: ' + (error.error?.error || 'Error desconocido'), 'error');
      }
    });
  }

  closeAllSessions() {
    this.userService.closeAllSessions().subscribe({
      next: (response) => {
        // Keep only current session in UI
        this.sessions = this.sessions.filter(s => s.isCurrent);
        this.showNotificationMessage('Todas las sesiones cerradas exitosamente');
      },
      error: (error) => {
        console.error('Error cerrando todas las sesiones', error);
        this.showNotificationMessage('Error al cerrar las sesiones: ' + (error.error?.error || 'Error desconocido'), 'error');
      }
    });
  }

  // =========================
  // Logout
  // =========================
  logout() {
    this.userService.logout().subscribe({
      next: (response) => {
        // Clear local storage and redirect
        this.userService.clearAuth();
        this.router.navigate(['login']);
      },
      error: (error) => {
        console.error('Error en logout', error);
        // Even if API call fails, clear local storage and redirect
        this.userService.clearAuth();
        this.router.navigate(['login']);
      }
    });
  }
}

