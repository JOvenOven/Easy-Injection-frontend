import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Scan {
  _id: string;
  alias: string;
  url: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'pendiente' | 'en_progreso' | 'finalizado' | 'error';
  flags: {
    xss: boolean;
    sqli: boolean;
  };
  vulnerabilidades: {
    count: number;
    types: string[];
  };
}

export interface ScanDetails {
  _id: string;
  alias: string;
  url: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: string;
  flags: {
    xss: boolean;
    sqli: boolean;
  };
  vulnerabilidades: Vulnerability[];
}

export interface Vulnerability {
  _id: string;
  tipo_id: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  nivel_severidad_id: {
    _id: string;
    nombre: string;
    nivel: number;
    color: string;
  };
  parametro_afectado?: string;
  url_afectada?: string;
  descripcion?: string;
  sugerencia?: string;
  referencia?: string;
}

export interface CreateScanRequest {
  alias: string;
  url: string;
  flags: {
    xss: boolean;
    sqli: boolean;
  };
  tipo_autenticacion?: string;
  credenciales?: {
    usuario_login: string;
    password_login: string;
  };
}

export interface UpdateScanRequest {
  estado?: string;
  fecha_fin?: string;
}

export interface AddVulnerabilityRequest {
  tipo_id: string;
  nivel_severidad_id: string;
  parametro_afectado?: string;
  url_afectada?: string;
  descripcion?: string;
  sugerencia?: string;
  referencia?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all scans for the authenticated user
  getScans(): Observable<{ success: boolean; scans: Scan[] }> {
    return this.http.get<{ success: boolean; scans: Scan[] }>(`${this.apiUrl}api/scans`, {
      headers: this.getHeaders()
    });
  }

  // Get specific scan details
  getScanDetails(scanId: string): Observable<{ success: boolean; scan: ScanDetails }> {
    return this.http.get<{ success: boolean; scan: ScanDetails }>(`${this.apiUrl}api/scans/${scanId}`, {
      headers: this.getHeaders()
    });
  }

  // Create a new scan
  createScan(scanData: CreateScanRequest): Observable<{ success: boolean; scan: Scan }> {
    return this.http.post<{ success: boolean; scan: Scan }>(`${this.apiUrl}api/scans`, scanData, {
      headers: this.getHeaders()
    });
  }

  // Update scan status
  updateScan(scanId: string, updateData: UpdateScanRequest): Observable<{ success: boolean; scan: Scan }> {
    return this.http.put<{ success: boolean; scan: Scan }>(`${this.apiUrl}api/scans/${scanId}`, updateData, {
      headers: this.getHeaders()
    });
  }

  // Delete a scan
  deleteScan(scanId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}api/scans/${scanId}`, {
      headers: this.getHeaders()
    });
  }

  // Add vulnerability to scan
  addVulnerability(scanId: string, vulnerabilityData: AddVulnerabilityRequest): Observable<{ success: boolean; vulnerability: any }> {
    return this.http.post<{ success: boolean; vulnerability: any }>(`${this.apiUrl}api/scans/${scanId}/vulnerabilities`, vulnerabilityData, {
      headers: this.getHeaders()
    });
  }
}
