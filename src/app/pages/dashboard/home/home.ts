import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  constructor(private router: Router) {}
  // Mock data temporal (luego lo puedes traer del backend)
  recentActivity = [
    {
      title: 'Escaneo completado',
      description: 'El escaneo de "Portal de administración" ha finalizado',
      time: 'Hace 2 horas'
    },
    {
      title: 'Logro desbloqueado',
      description: 'Has obtenido el logro "Cazador de XSS"',
      time: 'Hace 1 día'
    },
    {
      title: 'Nuevo recurso disponible',
      description: 'Se ha añadido un nuevo tutorial sobre prevención de SQLi',
      time: 'Hace 3 días'
    }
  ];
  
  stats = {
    escaneos: 12,
    vulnerabilidades: 37,
    puntos: 720,
    ranking: 5
  };

  goToNewScan() {
    this.router.navigate(['/dashboard/new-scan']);
  }

  goToScans() {
    this.router.navigate(['/dashboard/scans']);
  }

  goToTheory() {
    this.router.navigate(['/dashboard/theory']);
  }

  goToScoreboard() {
    this.router.navigate(['/dashboard/scoreboard']);
  }
}
