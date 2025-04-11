import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockInDialogComponent } from './clock-in-dialog.component';

describe('ClockInDialogComponent', () => {
  let component: ClockInDialogComponent;
  let fixture: ComponentFixture<ClockInDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClockInDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClockInDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
