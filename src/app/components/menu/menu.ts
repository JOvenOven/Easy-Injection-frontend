import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {
  isCollapsed = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

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
