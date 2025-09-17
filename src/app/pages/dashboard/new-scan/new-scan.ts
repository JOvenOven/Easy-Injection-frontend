import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface ScanType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-new-scan',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-scan.html',
  styleUrl: './new-scan.scss'
})
export class NewScanComponent implements OnInit {
  scanForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;

  // Available scan types
  scanTypes: ScanType[] = [
    {
      id: 'xss',
      name: 'XSS (Cross-Site Scripting)',
      description: 'Detecta vulnerabilidades de inyección de scripts maliciosos',
      icon: '</>',
      color: '#4ecdc4'
    },
    {
      id: 'sql',
      name: 'SQL Injection',
      description: 'Identifica puntos de inyección SQL en formularios y parámetros',
      icon: '💉',
      color: '#ff6b6b'
    },
    {
      id: 'both',
      name: 'Análisis Completo',
      description: 'Ejecuta ambos tipos de escaneo para un análisis exhaustivo',
      icon: '🛡️',
      color: '#45b7d1'
    }
  ];

  selectedScanType: string = 'both';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.scanForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      scanType: ['both', Validators.required],
      customHeaders: ['']
    });
  }

  ngOnInit(): void {
    // Set default scan type
    this.scanForm.patchValue({ scanType: 'both' });
  }

  selectScanType(scanTypeId: string) {
    this.selectedScanType = scanTypeId;
    this.scanForm.patchValue({ scanType: scanTypeId });
  }

  getUrlErrorMessage(): string {
    const urlControl = this.scanForm.get('url');
    if (!urlControl?.errors || !urlControl.touched) {
      return '';
    }

    if (urlControl.errors['required']) {
      return 'La URL es obligatoria';
    }
    if (urlControl.errors['pattern']) {
      return 'Ingresa una URL válida (debe comenzar con http:// o https://)';
    }
    return '';
  }

  onSubmit() {
    this.submitError = null;

    if (this.scanForm.valid) {
      this.isSubmitting = true;

      const formData = this.scanForm.value;
      
      // Generate scan name from URL
      const urlObj = new URL(formData.url);
      const scanName = `Escaneo de prueba - ${urlObj.hostname}`;
      
      // Simulate API call delay
      setTimeout(() => {
        // Navigate to scan progress page with scan data
        this.router.navigate(['/dashboard/scan-progress'], {
          queryParams: {
            url: formData.url,
            scanType: formData.scanType,
            customHeaders: formData.customHeaders || '',
            scanName: scanName
          }
        });
      }, 1000);
    } else {
      this.scanForm.markAllAsTouched();
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
