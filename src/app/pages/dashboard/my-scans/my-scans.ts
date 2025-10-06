import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScanService, Scan, ScanDetails, Vulnerability } from '../../../services/scan.service';

// Interfaces are now imported from the service

@Component({
  selector: 'app-my-scans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-scans.html',
  styleUrl: './my-scans.scss'
})
export class MyScansComponent implements OnInit, OnDestroy {
  scans: Scan[] = [];
  filteredScans: Scan[] = [];
  loading = true;
  error = '';

  // Search and filters
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  viewMode: 'list' | 'grid' = 'list';

  // Scan details modal
  showDetailsModal = false;
  selectedScan: ScanDetails | null = null;
  loadingDetails = false;

  // Actions menu
  showActionsMenu: string | null = null;

  // Filter options
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'finalizado', label: 'Completado' },
    { value: 'error', label: 'Error' }
  ];

  typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'xss', label: 'XSS' },
    { value: 'sqli', label: 'SQLi' },
    { value: 'both', label: 'XSS y SQLi' }
  ];

  constructor(
    private scanService: ScanService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadScans();
  }

  private addMockData(): void {
    // Add mock data for development when API fails
      const mockScans: Scan[] = [
        {
          _id: '1',
          alias: 'Escaneo sitio web corporativo',
          url: 'https://empresa-ejemplo.com',
          fecha_inicio: '2025-05-15T14:30:00Z',
          fecha_fin: '2025-05-15T15:45:00Z',
          estado: 'finalizado',
          flags: { xss: true, sqli: true },
          vulnerabilidades: { count: 4, types: ['XSS', 'SQLi'] }
        },
        {
          _id: '2',
          alias: 'Portal de administración',
          url: 'https://admin.ejemplo.com',
          fecha_inicio: '2025-05-10T09:15:00Z',
          fecha_fin: '2025-05-10T10:30:00Z',
          estado: 'finalizado',
          flags: { xss: false, sqli: true },
          vulnerabilidades: { count: 2, types: ['SQLi'] }
        },
        {
          _id: '3',
          alias: 'API de pagos',
          url: 'https://api.pagos.ejemplo.com',
          fecha_inicio: '2025-05-05T16:45:00Z',
          fecha_fin: '2025-05-05T17:20:00Z',
          estado: 'finalizado',
          flags: { xss: false, sqli: false },
          vulnerabilidades: { count: 0, types: [] }
        },
        {
          _id: '4',
          alias: 'Blog corporativo',
          url: 'https://blog.ejemplo.com',
          fecha_inicio: '2025-05-01T11:20:00Z',
          fecha_fin: '2025-05-01T12:10:00Z',
          estado: 'finalizado',
          flags: { xss: true, sqli: false },
          vulnerabilidades: { count: 5, types: ['XSS'] }
        },
        {
          _id: '5',
          alias: 'Tienda en línea',
          url: 'https://tienda.ejemplo.com',
          fecha_inicio: '2025-04-28T13:10:00Z',
          estado: 'error',
          flags: { xss: true, sqli: true },
          vulnerabilidades: { count: 0, types: [] }
        },
        {
          _id: '6',
          alias: 'Intranet',
          url: 'https://intranet.ejemplo.com',
          fecha_inicio: '2025-04-25T10:05:00Z',
          estado: 'en_progreso',
          flags: { xss: true, sqli: true },
          vulnerabilidades: { count: 0, types: [] }
        }
      ];

    this.scans = mockScans;
    this.filteredScans = [...this.scans];
    this.loading = false;
    this.error = ''; // Clear error when showing mock data
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadScans(): void {
    this.loading = true;
    this.error = '';

    this.scanService.getScans().subscribe({
      next: (response) => {
        this.scans = response.scans;
        this.filteredScans = [...this.scans];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading scans:', error);
        this.error = 'Error al cargar los escaneos';
        this.loading = false;
        // Add mock data for development when API fails
        this.addMockData();
      }
    });
  }

  searchScans(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredScans = this.scans.filter(scan => {
      const matchesSearch = !this.searchTerm || 
        scan.alias.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        scan.url.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || scan.estado === this.statusFilter;

      const matchesType = !this.typeFilter || 
        (this.typeFilter === 'xss' && scan.flags.xss) ||
        (this.typeFilter === 'sqli' && scan.flags.sqli) ||
        (this.typeFilter === 'both' && scan.flags.xss && scan.flags.sqli);

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'finalizado': return 'status-completed';
      case 'en_progreso': return 'status-progress';
      case 'error': return 'status-error';
      case 'pendiente': return 'status-pending';
      default: return 'status-unknown';
    }
  }

  getStatusLabel(estado: string): string {
    switch (estado) {
      case 'finalizado': return 'Completado';
      case 'en_progreso': return 'En progreso';
      case 'error': return 'Error';
      case 'pendiente': return 'Pendiente';
      default: return 'Desconocido';
    }
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'finalizado': return '✓';
      case 'en_progreso': return '⟳';
      case 'error': return '✗';
      case 'pendiente': return '⏳';
      default: return '?';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getVulnerabilityTypes(types: string[]): string {
    return types.join(', ');
  }

  toggleActionsMenu(scanId: string): void {
    this.showActionsMenu = this.showActionsMenu === scanId ? null : scanId;
  }

  closeActionsMenu(): void {
    this.showActionsMenu = null;
  }

  viewDetails(scan: Scan): void {
    this.loadingDetails = true;
    this.showDetailsModal = true;

    this.scanService.getScanDetails(scan._id).subscribe({
      next: (response) => {
        this.selectedScan = response.scan;
        this.loadingDetails = false;
      },
      error: (error) => {
        console.error('Error loading scan details:', error);
        this.loadingDetails = false;
        this.closeDetailsModal();
      }
    });
  }

  viewReport(scan: Scan): void {
    this.router.navigate(['/dashboard/scans', scan._id, 'report']);
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedScan = null;
    this.loadingDetails = false;
  }

  visitSite(url: string): void {
    window.open(url, '_blank');
  }

  deleteScan(scan: Scan): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el escaneo "${scan.alias}"?`)) {
      this.scanService.deleteScan(scan._id).subscribe({
        next: () => {
          this.loadScans();
          this.closeActionsMenu();
        },
        error: (error) => {
          console.error('Error deleting scan:', error);
          alert('Error al eliminar el escaneo');
        }
      });
    }
  }

  goToNewScan(): void {
    this.router.navigate(['/dashboard/new-scan']);
  }

  getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-unknown';
    }
  }

  getSeverityLabel(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return 'Desconocido';
    }
  }
}
