import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LessonProgressService } from '../../../../services/lesson-progress.service';
import { ALL_LESSON_IDS, LESSON_COUNTS, LESSON_IDS } from '../../../../constants/lessons.constants';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  completed: boolean;
  started: boolean;
}

interface Tab {
  label: string;
  value: string;
}

interface AdditionalResource {
  name: string;
  description: string;
  url: string;
}

@Component({
  selector: 'app-syllabus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './syllabus.html',
  styleUrl: './syllabus.scss'
})
export class SyllabusComponent implements OnInit {
  activeTab = 'all';
  searchTerm = '';
  progressPercentage = 0;
  completedLessons = 0;
  totalLessons = 0;
  completedIndividualLessons = 0;
  totalIndividualLessons = 0;
  loading = false;
  
  // Filtered lessons for search
  filteredSecurityBasicsLessons: Lesson[] = [];
  filteredXssLessons: Lesson[] = [];
  filteredSqlInjectionLessons: Lesson[] = [];

  tabs: Tab[] = [
    { value: 'all', label: 'Todo el contenido' },
    { value: 'xss', label: 'Cross-Site Scripting' },
    { value: 'sqli', label: 'Inyección SQL' }
  ];

  securityBasicsLessons: Lesson[] = [
    {
      id: 'intro-seguridad',
      title: 'Conceptos clave de seguridad, contexto y retos en web',
      description: 'Principios fundamentales de la seguridad en aplicaciones web.',
      content: 'Explora los conceptos esenciales de seguridad web, su contexto histórico y los retos actuales.',
      completed: false,
      started: false
    },
    {
      id: 'amenazas-vulnerabilidades',
      title: 'Amenazas y vulnerabilidades',
      description: 'Los riesgos más frecuentes y sus implicaciones en el entorno web moderno.',
      content: 'Conoce las amenazas más relevantes, la explotación de vulnerabilidades y su impacto.',
      completed: false,
      started: false
    },
    {
      id: 'fundamentos-tecnicos',
      title: 'Fundamentos técnicos',
      description: 'Estructura del protocolo HTTP, mecanismos de autenticación y gestión de sesiones.',
      content: 'Presenta el funcionamiento de HTTP, la importancia de las sesiones, cookies y los métodos de autenticación.',
      completed: false,
      started: false
    },
    {
      id: 'owasp-top-10',
      title: 'OWASP Top 10',
      description: 'Las vulnerabilidades más críticas según OWASP.',
      content: 'Conoce las diez vulnerabilidades más críticas según el Open Web Application Security Project (OWASP) y por qué son importantes.',
      completed: false,
      started: false
    },
    {
      id: 'modelo-amenazas-vectores',
      title: 'Modelo de amenazas y vectores de ataque frecuentes',
      description: 'Cómo se identifican y clasifican las amenazas en la web.',
      content: 'Analiza los modelos y metodologías para entender, mapear y categorizar los vectores de ataque más comunes.',
      completed: false,
      started: false
    },
    {
      id: 'impacto-operacional',
      title: 'Impacto operativo de los ataques web',
      description: 'Consecuencias reales de incidentes de seguridad en organizaciones.',
      content: 'Examina los efectos de violaciones de seguridad en empresas u organismos, considerando casos reales y estudios recientes.',
      completed: false,
      started: false
    },
    {
      id: 'ciclo-seguro-devsecops',
      title: 'Introducción al ciclo seguro de desarrollo (DevSecOps)',
      description: 'Metodologías integradas para el desarrollo seguro de software.',
      content: 'Describe el enfoque DevSecOps para incorporar seguridad en todas las fases del ciclo de desarrollo.',
      completed: false,
      started: false
    }
  ];

  xssLessons: Lesson[] = [
    {
      id: 'fundamentos-xss',
      title: 'Fundamentos de XSS',
      description: '¿Qué es XSS y cómo funciona?',
      content: 'Aprende qué es Cross-Site Scripting, cómo funciona y por qué representa un riesgo crítico en el desarrollo de aplicaciones web.',
      completed: false,
      started: false
    },
    {
      id: 'tipos-xss',
      title: 'Tipos de XSS',
      description: 'Clasificación y características de los distintos tipos de XSS.',
      content: 'Explora los tres tipos principales de XSS: reflejado, almacenado y basado en DOM, comprendiendo sus mecanismos y casos relevantes.',
      completed: false,
      started: false
    },
    {
      id: 'contextos-vectores-xss',
      title: 'Contextos y vectores de inyección',
      description: '¿Dónde y cómo puede inyectarse código malicioso mediante XSS?',
      content: 'Examina los diferentes contextos de inyección de XSS, , explicando cómo se aprovechan estos vectores en ataques reales.',
      completed: false,
      started: false
    },
    {
      id: 'ejemplos-xss',
      title: 'Ejemplos clásicos de explotación: payloads y escenarios',
      description: 'Demostraciones y análisis de casos prácticos de XSS.',
      content: 'Conzca ejemplos concretos de explotación de XSS para ilustrar el impacto de la vulnerabilidad en aplicaciones web.',
      completed: false,
      started: false
    },
    {
      id: 'evasion-xss',
      title: 'Técnicas de evasión y bypass de defensas',
      description: 'Métodos utilizados para evadir controles de seguridad contra XSS.',
      content: 'Explica las estrategias más empleadas para saltarse filtros y mecanismos de defensa.',
      completed: false,
      started: false
    },
    {
      id: 'prevencion-xss',
      title: 'Estrategias de prevención y mitigación',
      description: '¿Cómo proteger aplicaciones web frente a XSS?',
      content: 'Explica las mejores prácticas, enfoques y herramientas utilizados para prevenir y mitigar XSS.',
      completed: false,
      started: false
    },
    {
      id: 'impacto-xss',
      title: 'Impacto y riesgos reales del XSS en organizaciones',
      description: 'Consecuencias y daños atribuibles a la explotación de XSS.',
      content: 'Analiza el efecto de ataques XSS sobre la confidencialidad, integridad y disponibilidad de datos.',
      completed: false,
      started: false
    },
    {
      id: 'diseño-seguro-xss',
      title: 'Diseño seguro y buenas prácticas frente a XSS',
      description: 'Recomendaciones para el desarrollo seguro respecto a XSS.',
      content: 'Analiza pautas y ejemplos de diseño seguro que ayudan a evitar la introducción de XSS en el código.',
      completed: false,
      started: false
    }
  ];

  sqlInjectionLessons: Lesson[] = [
    {
      id: 'fundamentos-sqli',
      title: 'Fundamentos de Inyección SQL',
      description: '¿Qué es la Inyección SQL y cómo amenaza la seguridad?',
      content: 'Explica qué es la inyección SQL, cómo se produce y presenta ejemplos para entender su naturaleza y el alcance del riesgo.',
      completed: false,
      started: false
    },
    {
      id: 'tipos-sqli',
      title: 'Tipos de Inyección SQL',
      description: 'Clasificación de variantes de ataques SQL injection',
      content: 'Detalla las principales variantes de inyección SQL incluyendo sus diferencias técnicas, escenarios típicos y métodos empleados en auditorías y ataques.',
      completed: false,
      started: false
    },
    {
      id: 'ejemplos-sqli',
      title: 'Ejemplos y técnicas comunes de explotación',
      description: 'Payloads, queries y métodos frecuentes utilizados en la inyección SQL.',
      content: 'Ejemplos de consultas maliciosas, manipulación de parámetros y extracción de información mediante inyección SQL, destacando la lógica detrás de cada técnica.',
      completed: false,
      started: false
    },
    {
      id: 'fingerprinting-dbms',
      title: 'Reconocimiento y fingerprinting de bases de datos (DBMS)',
      description: '¿Cómo identificar el tipo y versión de servidor en ataques de inyección SQL?',
      content: 'Explica los métodos para reconocer el sistema gestor de base de datos (DBMS) objetivo en auditorías y ataques.',
      completed: false,
      started: false
    },
    {
      id: 'evasion-sqli',
      title: 'Técnicas avanzadas de evasión y manipulación',
      description: 'Métodos para saltar filtros y controles tradicionales en SQLi.',
      content: 'Describe las estrategias avanzadas que emplean los atacantes para evadir defensas, manipular entradas y explotar consultas SQL robustas.',
      completed: false,
      started: false
    },
    {
      id: 'prevencion-sqli',
      title: 'Estrategias de defensa y prevención',
      description: 'Buenas prácticas para proteger aplicaciones frente a la inyección SQL.',
      content: 'Detalla las recomendaciones técnicas y de diseño seguro para impedir la explotación de inyección SQL.',
      completed: false,
      started: false
    },
    {
      id: 'impacto-sqli',
      title: 'Impacto y consecuencias de la inyección SQL',
      description: 'Efectos y daños derivados de ataques exitosos de inyección SQL.',
      content: 'Expone los daños potenciales que pueden derivarse para una organización tras la explotación de inyección SQL.',
      completed: false,
      started: false
    },
    {
      id: 'diseño-seguro-sqli',
      title: 'Arquitectura segura y buenas prácticas contra la inyección SQL',
      description: 'Principios y recomendaciones para minimizar riesgos desde el diseño.',
      content: 'Describe los enfoques arquitectónicos y recomendaciones de desarrollo seguro que permiten minimizar o eliminar la exposición a SQL Injection.',
      completed: false,
      started: false
    }
  ];

  additionalResources: AdditionalResource[] = [
    {
      name: 'OWASP Cheat Sheet Series',
      description: 'Guías concisas sobre diferentes aspectos de la seguridad de aplicaciones web.',
      url: 'https://cheatsheetseries.owasp.org/'
    },
    {
      name: 'PortSwigger Web Security Academy',
      description: 'Laboratorios interactivos gratuitos para practicar habilidades de seguridad web.',
      url: 'https://portswigger.net/web-security'
    }
  ];

  constructor(
    private router: Router,
    private lessonProgressService: LessonProgressService
  ) {}

  ngOnInit(): void {
    // Set loading state
    this.loading = true;
    
    // First, migrate any old localStorage data to backend (one-time)
    this.lessonProgressService.migrateLocalStorageToBackend().subscribe({
      next: () => {
        // After migration, load progress
        this.loadCompletedLessons();
      },
      error: () => {
        // Even if migration fails, try to load progress
        this.loadCompletedLessons();
      }
    });
    
    // Also subscribe to progress changes for real-time updates
    this.lessonProgressService.progress$.subscribe({
      next: (stats) => {
        if (stats) {
          this.updateLessonsWithProgress(stats.completedLessons, stats.viewedLessons);
        }
      }
    });
  }

  private loadCompletedLessons(): void {
    // Load progress statistics from backend
    this.lessonProgressService.getProgressStats(ALL_LESSON_IDS).subscribe({
      next: (stats) => {
        this.updateLessonsWithProgress(stats.completedLessons, stats.viewedLessons);
        this.loading = false;
      },
      error: () => {
        // In case of error, show lessons without progress
        this.calculateProgress();
        this.loading = false;
      }
    });
  }

  private updateLessonsWithProgress(completedLessons: string[], viewedLessons: string[]): void {
    // Mark lessons as completed or started
    this.securityBasicsLessons = this.securityBasicsLessons.map(lesson => ({
      ...lesson,
      completed: completedLessons.includes(lesson.id),
      started: viewedLessons.includes(lesson.id) || completedLessons.includes(lesson.id)
    }));

    this.xssLessons = this.xssLessons.map(lesson => ({
      ...lesson,
      completed: completedLessons.includes(lesson.id),
      started: viewedLessons.includes(lesson.id) || completedLessons.includes(lesson.id)
    }));

    this.sqlInjectionLessons = this.sqlInjectionLessons.map(lesson => ({
      ...lesson,
      completed: completedLessons.includes(lesson.id),
      started: viewedLessons.includes(lesson.id) || completedLessons.includes(lesson.id)
    }));

    // Initialize filtered lessons
    this.filterLessons();

    // Calculate progress
    this.calculateProgress();
  }

  private calculateProgress(): void {
    const allLessons = [
      ...this.securityBasicsLessons,
      ...this.xssLessons,
      ...this.sqlInjectionLessons
    ];

    // Count individual completed lessons
    this.totalIndividualLessons = LESSON_COUNTS.TOTAL;
    this.completedIndividualLessons = allLessons.filter(lesson => lesson.completed).length;

    // Count how many categories are fully completed (all lessons in category are done)
    // This represents "complete lesson sets" rather than individual lessons
    let completedCategories = 0;
    const totalCategories = 3; // Security Basics, XSS, SQL Injection

    // Check Security Basics category
    const securityBasicsCompleted = LESSON_IDS.SECURITY_BASICS.every(lessonId =>
      allLessons.find(lesson => lesson.id === lessonId)?.completed === true
    );
    if (securityBasicsCompleted) {
      completedCategories++;
    }

    // Check XSS category
    const xssCompleted = LESSON_IDS.XSS.every(lessonId =>
      allLessons.find(lesson => lesson.id === lessonId)?.completed === true
    );
    if (xssCompleted) {
      completedCategories++;
    }

    // Check SQL Injection category
    const sqliCompleted = LESSON_IDS.SQL_INJECTION.every(lessonId =>
      allLessons.find(lesson => lesson.id === lessonId)?.completed === true
    );
    if (sqliCompleted) {
      completedCategories++;
    }

    // Count represents fully completed categories (lesson sets)
    this.totalLessons = totalCategories; // 3 categories total
    this.completedLessons = completedCategories; // Number of fully completed categories
    // Calculate percentage based on individual lessons completed
    this.progressPercentage = this.totalIndividualLessons > 0 ? Math.round((this.completedIndividualLessons / this.totalIndividualLessons) * 100) : 0;
  }

  
  onSearchChange(): void {
    this.filterLessons();
  }

  private filterLessons(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      // If no search term, show all lessons
      this.filteredSecurityBasicsLessons = [...this.securityBasicsLessons];
      this.filteredXssLessons = [...this.xssLessons];
      this.filteredSqlInjectionLessons = [...this.sqlInjectionLessons];
    } else {
      // Filter lessons by title, description, or content
      this.filteredSecurityBasicsLessons = this.securityBasicsLessons.filter(lesson =>
        lesson.title.toLowerCase().includes(term) ||
        lesson.description.toLowerCase().includes(term) ||
        lesson.content.toLowerCase().includes(term)
      );
      
      this.filteredXssLessons = this.xssLessons.filter(lesson =>
        lesson.title.toLowerCase().includes(term) ||
        lesson.description.toLowerCase().includes(term) ||
        lesson.content.toLowerCase().includes(term)
      );
      
      this.filteredSqlInjectionLessons = this.sqlInjectionLessons.filter(lesson =>
        lesson.title.toLowerCase().includes(term) ||
        lesson.description.toLowerCase().includes(term) ||
        lesson.content.toLowerCase().includes(term)
      );
    }
  }

  getLessonButtonText(lesson: Lesson): string {
    if (lesson.completed) {
      return 'Repasar lección';
    } else if (lesson.started) {
      return 'Continuar aprendiendo';
    } else {
      return 'Comenzar a aprender';
    }
  }

  navigateToLesson(lessonId: string): void {
    // Simplemente navegar a la lección - el progreso se marcará al completarla
    this.router.navigate(['/dashboard/theory/lesson', lessonId]);
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard/theory']);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  openExternalLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
