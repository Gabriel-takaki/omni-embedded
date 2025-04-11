import { MatDividerModule } from '@angular/material/divider';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMatIntlTelInputComponent } from './ngx-mat-intl-tel-input.component';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchPipe } from './search.pipe';

describe('NgxMatIntlTelInputComponent', () => {
  let component: NgxMatIntlTelInputComponent;
  let fixture: ComponentFixture<NgxMatIntlTelInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxMatIntlTelInputComponent,
        SearchPipe ],
      imports: [
        CommonModule,
    FormsModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMatIntlTelInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
