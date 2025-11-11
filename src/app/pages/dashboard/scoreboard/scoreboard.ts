import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Scan {
  id: number;
  name: string;
  correctAnswers: number;
  vulnerabilityScore: number;
  totalScore: number;
  rank: number;
}

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scoreboard.html',
  styleUrls: ['./scoreboard.scss']
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  scans: Scan[] = [];
  searchQuery: string = '';
  private intervalId: any;

  ngOnInit(): void {
    this.loadMockData();
    this.startPeriodicUpdate();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private loadMockData(): void {
    const mockScans: Scan[] = [
      { id: 1, name: "Escaneo Web Principal", correctAnswers: 487, vulnerabilityScore: 95, totalScore: 9850, rank: 1 },
      { id: 2, name: "API Security Scan", correctAnswers: 462, vulnerabilityScore: 92, totalScore: 9340, rank: 2 },
      { id: 3, name: "Database Analysis", correctAnswers: 435, vulnerabilityScore: 88, totalScore: 8720, rank: 3 },
      { id: 4, name: "Network Security", correctAnswers: 410, vulnerabilityScore: 85, totalScore: 8150, rank: 4 },
      { id: 5, name: "Mobile App Scan", correctAnswers: 395, vulnerabilityScore: 82, totalScore: 7890, rank: 5 },
      { id: 6, name: "Infrastructure Check", correctAnswers: 380, vulnerabilityScore: 80, totalScore: 7650, rank: 6 },
      { id: 7, name: "Cloud Security", correctAnswers: 365, vulnerabilityScore: 78, totalScore: 7320, rank: 7 },
      { id: 8, name: "Code Analysis", correctAnswers: 355, vulnerabilityScore: 75, totalScore: 7100, rank: 8 },
      { id: 9, name: "Web Application", correctAnswers: 340, vulnerabilityScore: 72, totalScore: 6850, rank: 9 },
      { id: 10, name: "Server Security", correctAnswers: 335, vulnerabilityScore: 70, totalScore: 6720, rank: 10 },
    ];

    this.scans = mockScans;
  }

  private startPeriodicUpdate(): void {
    this.intervalId = setInterval(() => {
      this.scans = this.scans
        .map(scan => ({
          ...scan,
          totalScore: scan.totalScore + Math.floor(Math.random() * 10)
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((scan, index) => ({ ...scan, rank: index + 1 }));
    }, 5000);
  }

  get filteredScans(): Scan[] {
    return this.scans.filter(scan => 
      scan.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  getMedalClass(rank: number): string {
    switch(rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-700';
      default: return '';
    }
  }

  getInitials(name: string): string {
    return name.substring(0, 2).toUpperCase();
  }

  formatScore(score: number): string {
    return score.toLocaleString();
  }
}
