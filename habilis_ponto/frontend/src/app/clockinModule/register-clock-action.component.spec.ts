import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterClockActionComponent } from './register-clock-action.component';

describe('RegisterClockActionComponent', () => {
  let component: RegisterClockActionComponent;
  let fixture: ComponentFixture<RegisterClockActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterClockActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterClockActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
