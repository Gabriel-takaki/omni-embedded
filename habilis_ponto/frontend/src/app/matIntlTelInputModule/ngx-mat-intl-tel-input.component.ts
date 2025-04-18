import {MatLegacyFormFieldControl as MatFormFieldControl} from '@angular/material/legacy-form-field';
import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {FormGroupDirective, NG_VALIDATORS, NgControl, NgForm} from '@angular/forms';
import {CountryCode, Examples} from './data/country-code';
import {phoneNumberValidator} from './ngx-mat-intl-tel-input.validator';
import {Country} from './model/country.model';
import {PhoneNumberFormat} from './model/phone-number-format.model';
import {
  AsYouType,
  CountryCode as CC,
  E164Number,
  getExampleNumber,
  parsePhoneNumberFromString,
  PhoneNumber,
  Metadata,
  isValidPhoneNumber, NationalNumber
} from 'libphonenumber-js/max';

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Subject} from 'rxjs';
import {FocusMonitor} from '@angular/cdk/a11y';
import {CanUpdateErrorState, ErrorStateMatcher, mixinErrorState} from '@angular/material/core';
import {MatLegacyMenu as MatMenu} from '@angular/material/legacy-menu';

// import {formatNumber} from "libphonenumber-js/custom";

class NgxMatIntlTelInputBase {
  // tslint:disable-next-line:variable-name
  constructor(public _defaultErrorStateMatcher: ErrorStateMatcher,
              // tslint:disable-next-line:variable-name
              public _parentForm: NgForm,
              // tslint:disable-next-line:variable-name
              public _parentFormGroup: FormGroupDirective,
              /** @docs-private */
              public ngControl: NgControl) {
  }
}

// tslint:disable-next-line:variable-name
// @ts-ignore
const _NgxMatIntlTelInputMixinBase: any & typeof NgxMatIntlTelInputBase = mixinErrorState(NgxMatIntlTelInputBase);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-mat-intl-tel-input',
  templateUrl: './ngx-mat-intl-tel-input.component.html',
  styleUrls: ['./ngx-mat-intl-tel-input.component.scss'],
  providers: [
    CountryCode,
    {provide: MatFormFieldControl, useExisting: NgxMatIntlTelInputComponent},
    {
      provide: NG_VALIDATORS,
      useValue: phoneNumberValidator,
      multi: true,
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NgxMatIntlTelInputComponent extends _NgxMatIntlTelInputMixinBase
  implements OnInit, OnDestroy, DoCheck, MatFormFieldControl<any> {
  static nextId = 0;

  @Input() preferredCountries: Array<string> = [];
  @Input() enablePlaceholder = true;
  @Input() inputPlaceholder: string;
  @Input() cssClass;
  @Input() name: string;
  @Input() onlyCountries: Array<string> = [];
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() enableSearch = false;

  @Input() phoneNumber = '';
  @Output() phoneNumberChange = new EventEmitter<string>();
  @Output() valid = new EventEmitter<boolean>();
  @Output() enterPress = new EventEmitter<boolean>();

  @ViewChild(MatMenu) matMenu: MatMenu;
  // tslint:disable-next-line:variable-name
  private _placeholder: string;
  // tslint:disable-next-line:variable-name
  private _required = false;
  // tslint:disable-next-line:variable-name
  private _disabled = false;
  stateChanges = new Subject<void>();
  focused = false;
  @HostBinding() id = `ngx-mat-intl-tel-input-${NgxMatIntlTelInputComponent.nextId++}`;
  describedBy = '';
  internalPhoneNumber: any = '';
  allCountries: Array<Country> = [];
  preferredCountriesInDropDown: Array<Country> = [];
  selectedCountry: Country;
  numberInstance: PhoneNumber;
  value;
  searchCriteria: string;
  errorState;
  @Output() countryChanged: EventEmitter<Country> = new EventEmitter<Country>();

  private previousFormattedNumber: string;
  // tslint:disable-next-line:variable-name
  private _format: PhoneNumberFormat = 'default';

  static getPhoneNumberPlaceHolder(countryISOCode: any): string {
    try {
      // return getExampleNumber(countryISOCode, Examples).number.toString();
      return '';
      // return format(Examples[countryISOCode], 'National');
    } catch (e) {
      return e;
    }
  }

  onTouched = () => {
  };

  propagateChange = (_: any) => {
  };

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private countryCodeData: CountryCode,
    private fm: FocusMonitor,
    public elRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl,
    // tslint:disable-next-line:variable-name
    @Optional() _parentForm: NgForm,
    // tslint:disable-next-line:variable-name
    @Optional() _parentFormGroup: FormGroupDirective,
    // tslint:disable-next-line:variable-name
    _defaultErrorStateMatcher: ErrorStateMatcher,
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
    fm.monitor(elRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });
    this.fetchCountryData();
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    if (this.preferredCountries.length) {
      this.preferredCountries.forEach(iso2 => {
        const preferredCountry = this.allCountries.filter((c) => {
          return c.iso2 === iso2;
        }).shift();
        this.preferredCountriesInDropDown.push(preferredCountry);
      });
    }
    if (this.onlyCountries.length) {
      this.allCountries = this.allCountries.filter(c => this.onlyCountries.includes(c.iso2));
    }
    if (this.numberInstance && this.numberInstance.country) {
      // If an existing number is present, we use it to determine selectedCountry
      this.selectedCountry = this.getCountry(this.numberInstance.country);
    } else {
      if (this.preferredCountriesInDropDown.length) {
        this.selectedCountry = this.preferredCountriesInDropDown[0];
      } else {
        this.selectedCountry = this.allCountries[0];
      }
    }
    this.countryChanged.emit(this.selectedCountry);
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  updateErrorState() {

  }

  ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  public onPaste(event) {
    const tratado = event.clipboardData.getData('text').replace(/\D+/g, '');
    if (!tratado) {
      event.preventDefault();
      return false;
    }
  }

  public onPhoneNumberChange(): void {
    this.internalPhoneNumber = this.internalPhoneNumber.replace(/\D+/g, '') || null;
    this._changeDetectorRef.detectChanges();
    if (!this.internalPhoneNumber) {
      return;
    }
    try {
      this.numberInstance = parsePhoneNumberFromString(this.internalPhoneNumber.toString(), this.selectedCountry.iso2.toUpperCase() as CC);
      this.formatAsYouTypeIfEnabled();
      this.value = this.numberInstance.number;
      if (this.numberInstance && this.numberInstance.isValid()) {
        if (this.internalPhoneNumber !== this.nationalFormattedPhoneNumber) {
          this.internalPhoneNumber = this.nationalFormattedPhoneNumber;
        }
        if (this.selectedCountry.iso2 !== this.numberInstance.country) {
          this.selectedCountry = this.getCountry(this.numberInstance.country);
          this.countryChanged.emit(this.selectedCountry);
        }
      }
    } catch (e) {
      // if no possible numbers are there,
      // then the full number is passed so that validator could be triggered and proper error could be shown
      this.value = this.internalPhoneNumber.toString();
    }
    this.phoneNumberChange.emit(this.internationalFormattedPhoneNumber);
    // @ts-ignore
    this.valid.emit(isValidPhoneNumber(this.internationalFormattedPhoneNumber, {defaultCountry: this.selectedCountry.iso2}));
    this.propagateChange(this.value);
    this._changeDetectorRef.markForCheck();
  }

  public onCountrySelect(country: Country, el): void {
    if (this.internalPhoneNumber) {
      this.internalPhoneNumber = this.numberInstance.nationalNumber;
    }
    this.selectedCountry = country;
    this.countryChanged.emit(this.selectedCountry);
    this.onPhoneNumberChange();
    el.focus();
  }

  public getCountry(code) {
    return this.allCountries.find(c => c.iso2 === code.toLowerCase()) || {
      name: 'UN',
      iso2: 'UN',
      dialCode: undefined,
      priority: 0,
      areaCodes: undefined,
      flagClass: 'UN',
      placeHolder: ''
    };
  }

  public onInputKeyPress(event): void {
    const pattern = /[0-9+\- ]/;
    if (event.key === 'Enter') {
      this.enterPress.emit(event);
      return;
    }
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  protected fetchCountryData(): void {
    this.countryCodeData.allCountries.forEach(c => {
      const country: Country = {
        name: c[0].toString(),
        iso2: c[1].toString(),
        dialCode: c[2].toString(),
        priority: +c[3] || 0,
        areaCodes: c[4] as string[] || undefined,
        flagClass: c[1].toString().toUpperCase(),
        placeHolder: ''
      };

      if (this.enablePlaceholder) {
        country.placeHolder = NgxMatIntlTelInputComponent.getPhoneNumberPlaceHolder(country.iso2.toUpperCase());
      }

      this.allCountries.push(country);
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  writeValue(value: any): void {
    if (value) {
      this.numberInstance = parsePhoneNumberFromString(value);
      if (this.numberInstance) {
        const countryCode = this.numberInstance.country;
        this.internalPhoneNumber = this.nationalFormattedPhoneNumber;
        if (!countryCode) {
          return;
        }
        setTimeout(() => {
          this.selectedCountry = this.getCountry(countryCode);
          if (this.selectedCountry.dialCode && !this.preferredCountries.includes(this.selectedCountry.iso2)) {
            this.preferredCountriesInDropDown.push(this.selectedCountry);
          }
          this.countryChanged.emit(this.selectedCountry);

          // Initial value is set
          this._changeDetectorRef.markForCheck();
          this.stateChanges.next();
        }, 1);
      } else {
        this.internalPhoneNumber = value;
      }
    }

    // Value is set from outside using setValue()
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  get empty() {
    return !this.internalPhoneNumber;
  }

  @HostBinding('class.ngx-floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      // tslint:disable-next-line:no-non-null-assertion
      this.elRef.nativeElement.querySelector('input')!.focus();
    }
  }

  reset() {
    this.internalPhoneNumber = '';
    this.propagateChange(null);

    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef);
  }

  private get nationalFormattedPhoneNumber(): string {
    if (!this.numberInstance) {
      return this.internalPhoneNumber.toString();
    }
    return this.numberInstance.formatNational();
  }


  private get internationalFormattedPhoneNumber(): string {
    if (!this.numberInstance) {
      return this.internalPhoneNumber.toString();
    }
    return this.numberInstance.formatInternational();
  }

  private formatAsYouTypeIfEnabled(): void {
    const asYouType: AsYouType = new AsYouType(this.selectedCountry.iso2.toUpperCase() as CC);
    // To avoid caret positioning we apply formatting only if the caret is at the end:
    if (this.internalPhoneNumber.toString().startsWith(this.previousFormattedNumber || '')) {
      this.internalPhoneNumber = asYouType.input(this.internalPhoneNumber.toString());
    }
    this.previousFormattedNumber = this.internalPhoneNumber.toString();
  }
}
