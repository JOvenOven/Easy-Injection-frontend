import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
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
}
