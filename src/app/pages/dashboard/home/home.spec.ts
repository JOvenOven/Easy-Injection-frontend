import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { ActivityService } from '../../../services/activity.service';
import { ScoreboardService } from '../../../services/scoreboard.service';
import { of } from 'rxjs';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let activityService: jasmine.SpyObj<ActivityService>;
  let scoreboardService: jasmine.SpyObj<ScoreboardService>;

  beforeEach(async () => {
    const activityServiceSpy = jasmine.createSpyObj('ActivityService', ['getActivities', 'getUserStatistics']);
    const scoreboardServiceSpy = jasmine.createSpyObj('ScoreboardService', ['getUserRanking']);
    
    activityServiceSpy.getActivities.and.returnValue(of([]));
    activityServiceSpy.getUserStatistics.and.returnValue(of({
      scansPerformed: 0,
      vulnerabilitiesDetected: 0,
      bestScore: 0,
      bestScanAlias: 'N/A'
    }));
    scoreboardServiceSpy.getUserRanking.and.returnValue(of({ position: 1, totalPoints: 0 }));

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: ActivityService, useValue: activityServiceSpy },
        { provide: ScoreboardService, useValue: scoreboardServiceSpy }
      ]
    })
    .compileComponents();

    activityService = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    scoreboardService = TestBed.inject(ScoreboardService) as jasmine.SpyObj<ScoreboardService>;
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize stats with default values', () => {
    expect(component.stats.scansPerformed).toBe(0);
    expect(component.stats.vulnerabilitiesDetected).toBe(0);
  });
});
