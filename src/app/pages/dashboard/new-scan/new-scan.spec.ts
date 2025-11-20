import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NewScanComponent } from './new-scan';

describe('NewScanComponent', () => {
  let component: NewScanComponent;
  let fixture: ComponentFixture<NewScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewScanComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
