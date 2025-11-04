import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-indicator.html',
  styleUrl: './progress-indicator.scss'
})
export class ProgressIndicatorComponent {
  @Input() steps: number = 7;
  @Input() currentStep: number = 1;

  get stepArray(): number[] {
    return Array.from({ length: this.steps }, (_, i) => i + 1);
  }

  getStepClass(step: number): string {
    if (step < this.currentStep) {
      return 'completed';
    } else if (step === this.currentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  }
}
