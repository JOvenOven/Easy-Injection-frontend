import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ScanProgressComponent } from './scan-progress';

describe('ScanProgressComponent', () => {
  let component: ScanProgressComponent;
  let fixture: ComponentFixture<ScanProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanProgressComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
