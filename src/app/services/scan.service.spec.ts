import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ScanService, Scan, CreateScanRequest, AddVulnerabilityRequest } from './scan.service';
import { environment } from '../../environments/environment';

describe('ScanService - Funciones Críticas', () => {
  let service: ScanService;
  let httpMock: HttpTestingController;

  const mockToken = 'mock-jwt-token';
  
  const mockScan: Scan = {
    _id: 'scan123',
    alias: 'Test Scan',
    url: 'https://example.com',
    fecha_inicio: '2024-01-01T10:00:00Z',
    estado: 'en_progreso',
    flags: {
      xss: true,
      sqli: true
    },
    vulnerabilidades: {
      count: 2,
      types: ['XSS', 'SQL Injection']
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ScanService]
    });

    service = TestBed.inject(ScanService);
    httpMock = TestBed.inject(HttpTestingController);
    
    localStorage.clear();
    localStorage.setItem('authToken', mockToken);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('API de Scans', () => {
    it('debería crear el servicio', () => {
      expect(service).toBeTruthy();
    });

    it('debería obtener lista de scans', (done) => {
      const mockResponse = { success: true, scans: [mockScan] };

      service.getScans().subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.scans.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockResponse);
    });

    it('debería crear scan con XSS y SQLi (Dalfox + sqlmap)', (done) => {
      const scanData: CreateScanRequest = {
        alias: 'Scan Completo',
        url: 'https://testsite.com',
        flags: {
          xss: true,
          sqli: true
        }
      };

      const mockResponse = { success: true, scan: mockScan };

      service.createScan(scanData).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.scan.flags.xss).toBeTrue();
        expect(response.scan.flags.sqli).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.flags.xss).toBeTrue();
      expect(req.request.body.flags.sqli).toBeTrue();
      req.flush(mockResponse);
    });

    it('debería crear scan solo con Dalfox (XSS)', (done) => {
      const scanData: CreateScanRequest = {
        alias: 'Scan XSS',
        url: 'https://testsite.com',
        flags: {
          xss: true,
          sqli: false
        }
      };

      const mockResponse = { 
        success: true, 
        scan: { ...mockScan, flags: { xss: true, sqli: false } }
      };

      service.createScan(scanData).subscribe(response => {
        expect(response.scan.flags.xss).toBeTrue();
        expect(response.scan.flags.sqli).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans`);
      expect(req.request.body.flags.xss).toBeTrue();
      req.flush(mockResponse);
    });

    it('debería crear scan solo con sqlmap (SQLi)', (done) => {
      const scanData: CreateScanRequest = {
        alias: 'Scan SQLi',
        url: 'https://testsite.com',
        flags: {
          xss: false,
          sqli: true
        }
      };

      const mockResponse = { 
        success: true, 
        scan: { ...mockScan, flags: { xss: false, sqli: true } }
      };

      service.createScan(scanData).subscribe(response => {
        expect(response.scan.flags.sqli).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans`);
      expect(req.request.body.flags.sqli).toBeTrue();
      req.flush(mockResponse);
    });

    it('debería actualizar estado de scan', (done) => {
      const scanId = 'scan123';
      const updatedScan = { ...mockScan, estado: 'finalizado' as const };
      const mockResponse = { success: true, scan: updatedScan };

      service.updateScan(scanId, { estado: 'finalizado' }).subscribe(response => {
        expect(response.scan.estado).toBe('finalizado');
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans/${scanId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('debería eliminar scan', (done) => {
      const scanId = 'scan123';
      const mockResponse = { success: true, message: 'Scan eliminado' };

      service.deleteScan(scanId).subscribe(response => {
        expect(response.success).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans/${scanId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('Gestión de Vulnerabilidades', () => {
    it('debería agregar vulnerabilidad XSS (desde Dalfox)', (done) => {
      const scanId = 'scan123';
      const vulnerabilityData: AddVulnerabilityRequest = {
        tipo_id: 'xss-type-id',
        nivel_severidad_id: 'high-severity-id',
        parametro_afectado: 'search',
        url_afectada: 'https://example.com/search',
        descripcion: 'XSS detectado por Dalfox'
      };

      const mockResponse = { 
        success: true, 
        vulnerability: { _id: 'vuln123', ...vulnerabilityData }
      };

      service.addVulnerability(scanId, vulnerabilityData).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.vulnerability.descripcion).toContain('Dalfox');
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans/${scanId}/vulnerabilities`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('debería agregar vulnerabilidad SQLi (desde sqlmap)', (done) => {
      const scanId = 'scan123';
      const vulnerabilityData: AddVulnerabilityRequest = {
        tipo_id: 'sqli-type-id',
        nivel_severidad_id: 'critical-severity-id',
        parametro_afectado: 'id',
        descripcion: 'SQL Injection detectado por sqlmap'
      };

      const mockResponse = { 
        success: true, 
        vulnerability: { _id: 'vuln124', ...vulnerabilityData }
      };

      service.addVulnerability(scanId, vulnerabilityData).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.vulnerability.descripcion).toContain('sqlmap');
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans/${scanId}/vulnerabilities`);
      req.flush(mockResponse);
    });
  });

  describe('Generación de Reportes', () => {
    it('debería obtener reporte completo', (done) => {
      const scanId = 'scan123';
      const mockReport = {
        success: true,
        report: {
          scan: mockScan,
          vulnerabilities: [],
          statistics: {
            total_vulnerabilities: 1,
            by_severity: { high: 1 },
            by_type: { xss: 1 }
          },
          tools_used: ['Dalfox', 'sqlmap']
        }
      };

      service.getScanReport(scanId).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.report.tools_used).toContain('Dalfox');
        expect(response.report.tools_used).toContain('sqlmap');
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/scans/${scanId}/report`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReport);
    });
  });
});
