import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface ScanPhase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  startTime?: Date;
  endTime?: Date;
}

export interface DiscoveredEndpoint {
  path: string;
  method: string;
  status: 'pending' | 'analyzing' | 'vulnerable' | 'safe';
  parameters?: string[];
}

export interface ScanLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DetectedVulnerability {
  id: string;
  type: 'XSS' | 'SQLi';
  severity: 'critical' | 'high' | 'medium' | 'low';
  endpoint: string;
  parameter: string;
  detectedAt: Date;
  description?: string;
}

export interface EvaluationQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  isAnswered: boolean;
}

export interface ScanStats {
  endpoints: number;
  parameters: number;
  xssFound: number;
  sqliFound: number;
}

@Component({
  selector: 'app-scan-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scan-progress.html',
  styleUrl: './scan-progress.scss'
})
export class ScanProgressComponent implements OnInit, OnDestroy {
  scanUrl: string = '';
  scanType: string = '';
  customHeaders: string = '';
  scanName: string = '';
  
  // Scan state
  isScanning = true;
  isPaused = false;
  scanComplete = false;
  scanError = false;
  errorMessage = '';
  overallProgress = 9;

  // Scan phases
  scanPhases: ScanPhase[] = [];
  currentPhaseIndex = 0;

  // Discovered endpoints
  discoveredEndpoints: DiscoveredEndpoint[] = [];
  totalEndpoints = 5;

  // Scan logs
  scanLogs: ScanLog[] = [];

  // Detected vulnerabilities
  detectedVulnerabilities: DetectedVulnerability[] = [];

  // Evaluation questions
  evaluationQuestions: EvaluationQuestion[] = [];
  currentQuestionIndex = 0;
  questionsAnswered = 0;
  totalQuestions = 5;
  showEvaluationQuestions = true;

  // Statistics
  scanStats: ScanStats = {
    endpoints: 0,
    parameters: 0,
    xssFound: 0,
    sqliFound: 0
  };

  // Results modal
  showResultsModal = false;

  // WebSocket simulation
  private scanInterval?: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get scan parameters from query params
    this.route.queryParams.subscribe(params => {
      this.scanUrl = params['url'] || '';
      this.scanType = params['scanType'] || 'both';
      this.customHeaders = params['customHeaders'] || '';
      this.scanName = params['scanName'] || 'Escaneo';
      
      this.initializeScanPhases();
      this.initializeEvaluationQuestions();
      this.startScan();
    });
  }

  ngOnDestroy(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
  }

  initializeScanPhases(): void {
    this.scanPhases = [
      {
        id: 'initialization',
        name: 'Inicialización',
        status: 'completed',
        progress: 100,
        startTime: new Date('2024-01-15T16:54:23'),
        endTime: new Date('2024-01-15T16:54:23')
      },
      {
        id: 'endpoint-discovery',
        name: 'Descubrimiento de endpoints',
        status: 'running',
        progress: 83,
        startTime: new Date('2024-01-15T16:54:23')
      },
      {
        id: 'parameter-analysis',
        name: 'Análisis de parámetros',
        status: 'pending',
        progress: 0
      },
      {
        id: 'xss-tests',
        name: 'Pruebas XSS',
        status: 'pending',
        progress: 0
      },
      {
        id: 'sqli-tests',
        name: 'Pruebas SQLI',
        status: 'pending',
        progress: 0
      },
      {
        id: 'report-generation',
        name: 'Generación de reporte',
        status: 'pending',
        progress: 0
      }
    ];

    // Initialize discovered endpoints
    this.discoveredEndpoints = [
      { path: '/admin/login', method: 'POST', status: 'analyzing', parameters: ['username', 'password'] },
      { path: '/admin/dashboard', method: 'GET', status: 'analyzing', parameters: ['session_id'] },
      { path: '/admin/users', method: 'GET', status: 'pending', parameters: ['page', 'limit'] },
      { path: '/admin/products/search', method: 'GET', status: 'vulnerable', parameters: ['q', 'category'] }
    ];

    this.scanStats.endpoints = this.discoveredEndpoints.length;
  }

  initializeEvaluationQuestions(): void {
    this.evaluationQuestions = [
      {
        id: 1,
        question: '¿Cuál de las siguientes es una técnica efectiva para prevenir ataques XSS?',
        options: [
          'Almacenar contraseñas en texto plano',
          'Usar validación de entrada y escapado de salida',
          'Desactivar los mensajes de error en producción',
          'Aumentar el tiempo de espera de las sesiones'
        ],
        correctAnswer: 1,
        isAnswered: false
      },
      {
        id: 2,
        question: '¿Qué es SQL Injection?',
        options: [
          'Un tipo de ataque de denegación de servicio',
          'La inyección de código SQL malicioso en aplicaciones',
          'Un método de cifrado de datos',
          'Una técnica de autenticación'
        ],
        correctAnswer: 1,
        isAnswered: false
      },
      {
        id: 3,
        question: '¿Cuál es la diferencia entre XSS reflejado y almacenado?',
        options: [
          'No hay diferencia',
          'El reflejado se ejecuta inmediatamente, el almacenado se guarda',
          'El almacenado es más peligroso que el reflejado',
          'Solo el reflejado puede robar cookies'
        ],
        correctAnswer: 1,
        isAnswered: false
      },
      {
        id: 4,
        question: '¿Qué es la validación de entrada?',
        options: [
          'Verificar que los datos cumplan con un formato específico',
          'Cifrar los datos antes de almacenarlos',
          'Generar tokens de autenticación',
          'Monitorear el tráfico de red'
        ],
        correctAnswer: 0,
        isAnswered: false
      },
      {
        id: 5,
        question: '¿Cuál es el objetivo principal de un escaneo de vulnerabilidades?',
        options: [
          'Aumentar el rendimiento del servidor',
          'Identificar y reportar vulnerabilidades de seguridad',
          'Mejorar la experiencia del usuario',
          'Reducir el uso de ancho de banda'
        ],
        correctAnswer: 1,
        isAnswered: false
      }
    ];
  }

  startScan(): void {
    this.isScanning = true;
    this.scanComplete = false;
    this.scanError = false;
    
    // Initialize scan logs
    this.addLog('Iniciando escaneo...', 'info');
    this.addLog(`Conectando con el objetivo: ${this.scanUrl}`, 'info');
    this.addLog('Conexión establecida', 'success');
    this.addLog('> Iniciando descubrimiento de endpoints', 'info');
    
    // Simulate real-time scan progress
    this.simulateRealTimeScan();
  }

  simulateRealTimeScan(): void {
    let logCounter = 0;
    const logMessages = [
      '> Endpoint descubierto: /admin/login',
      '> Endpoint descubierto: /admin/dashboard', 
      '> Endpoint descubierto: /admin/users',
      '> Endpoint descubierto: /admin/products/search',
      '> Iniciando análisis de parámetros',
      '> Detectando vulnerabilidad XSS en /admin/products/search',
      '> Detectando vulnerabilidad SQLi en /admin/products/search',
      '> Generando reporte de vulnerabilidades'
    ];

    this.scanInterval = setInterval(() => {
      if (logCounter < logMessages.length) {
        this.addLog(logMessages[logCounter], 'info');
        logCounter++;
      }

      // Simulate vulnerability detection
      if (logCounter === 6) {
        this.addVulnerability({
          id: 'xss-001',
          type: 'XSS',
          severity: 'high',
          endpoint: '/admin/products/search',
          parameter: 'q',
          detectedAt: new Date(),
          description: 'XSS reflejado detectado en parámetro de búsqueda'
        });
        this.scanStats.xssFound++;
      }

      if (logCounter === 7) {
        this.addVulnerability({
          id: 'sqli-001',
          type: 'SQLi',
          severity: 'critical',
          endpoint: '/admin/products/search',
          parameter: 'category',
          detectedAt: new Date(),
          description: 'SQL Injection detectado en parámetro de categoría'
        });
        this.scanStats.sqliFound++;
      }

      // Update progress
      this.updateScanProgress();

      // Complete scan after all logs
      if (logCounter >= logMessages.length) {
        this.completeScan();
      }
    }, 2000);
  }

  addLog(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    this.scanLogs.push({
      timestamp: new Date(),
      message,
      type
    });
  }

  addVulnerability(vuln: DetectedVulnerability): void {
    this.detectedVulnerabilities.push(vuln);
  }

  updateScanProgress(): void {
    // Simulate progress updates
    if (this.overallProgress < 100) {
      this.overallProgress += Math.floor(Math.random() * 5) + 1;
      if (this.overallProgress > 100) this.overallProgress = 100;
    }

    // Update current phase progress
    const currentPhase = this.scanPhases[this.currentPhaseIndex];
    if (currentPhase && currentPhase.status === 'running') {
      currentPhase.progress += Math.floor(Math.random() * 10) + 5;
      if (currentPhase.progress >= 100) {
        currentPhase.progress = 100;
        currentPhase.status = 'completed';
        currentPhase.endTime = new Date();
        this.currentPhaseIndex++;
        
        // Start next phase
        if (this.currentPhaseIndex < this.scanPhases.length) {
          this.scanPhases[this.currentPhaseIndex].status = 'running';
          this.scanPhases[this.currentPhaseIndex].startTime = new Date();
        }
      }
    }
  }

  completeScan(): void {
    this.isScanning = false;
    this.scanComplete = true;
    this.overallProgress = 100;
    
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }

    // Complete all phases
    this.scanPhases.forEach(phase => {
      if (phase.status === 'running') {
        phase.status = 'completed';
        phase.progress = 100;
        phase.endTime = new Date();
      }
    });

    this.addLog('Escaneo completado exitosamente', 'success');
  }

  // Scan control methods
  pauseScan(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.addLog('Escaneo pausado', 'warning');
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
      }
    } else {
      this.addLog('Escaneo reanudado', 'info');
      this.simulateRealTimeScan();
    }
  }

  stopScan(): void {
    this.isScanning = false;
    this.addLog('Escaneo detenido por el usuario', 'warning');
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
  }

  // Evaluation questions methods
  selectAnswer(questionId: number, answerIndex: number): void {
    const question = this.evaluationQuestions.find(q => q.id === questionId);
    if (question && !question.isAnswered) {
      question.userAnswer = answerIndex;
      question.isAnswered = true;
      this.questionsAnswered++;
      
      if (answerIndex === question.correctAnswer) {
        this.addLog(`Pregunta ${questionId} respondida correctamente`, 'success');
      } else {
        this.addLog(`Pregunta ${questionId} respondida incorrectamente`, 'warning');
      }
    }
  }

  verifyAnswer(questionId: number): void {
    const question = this.evaluationQuestions.find(q => q.id === questionId);
    if (question && question.userAnswer !== undefined) {
      if (question.userAnswer === question.correctAnswer) {
        this.addLog(`¡Correcto! Pregunta ${questionId} respondida correctamente`, 'success');
      } else {
        this.addLog(`Incorrecto. La respuesta correcta era la opción ${question.correctAnswer + 1}`, 'warning');
      }
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  // Results modal methods
  showResults(): void {
    this.showResultsModal = true;
  }

  closeResults(): void {
    this.showResultsModal = false;
  }

  // Utility methods
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-unknown';
    }
  }

  getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return 'Desconocido';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'analyzing': return 'status-analyzing';
      case 'vulnerable': return 'status-vulnerable';
      case 'safe': return 'status-safe';
      default: return 'status-unknown';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'analyzing': return 'Analizando';
      case 'vulnerable': return 'Vulnerable';
      case 'safe': return 'Seguro';
      default: return 'Desconocido';
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  goToNewScan(): void {
    this.router.navigate(['/dashboard/new-scan']);
  }

  goToScans(): void {
    this.router.navigate(['/dashboard/scans']);
  }

  downloadReport(): void {
    // TODO: Implement report download
    console.log('Downloading report...');
  }

  roundProgress(progress: number): number {
    return Math.round(progress);
  }
}
