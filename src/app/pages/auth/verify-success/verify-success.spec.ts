import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VerifySuccessComponent } from './verify-success';

describe('VerifySuccessComponent', () => {
  let component: VerifySuccessComponent;
  let fixture: ComponentFixture<VerifySuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifySuccessComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifySuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
