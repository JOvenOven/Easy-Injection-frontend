import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanProgressComponent } from './scan-progress';

describe('ScanProgressComponent', () => {
  let component: ScanProgressComponent;
  let fixture: ComponentFixture<ScanProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanProgressComponent]
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
