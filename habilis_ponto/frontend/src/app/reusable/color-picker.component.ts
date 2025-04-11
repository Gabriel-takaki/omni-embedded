import {Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output} from "@angular/core";
import {Color, ColorPickerControl} from "@iplab/ngx-color-picker";

@Component({
  selector: 'app-color-picker',
  templateUrl: 'color-picker.component.html',
  styleUrls: ['color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {

  public colorControl = new ColorPickerControl();

  public isVisible = false;
  public _disabled = false;
  public _color = '';

  @Input() label = '';
  @Input() mini = false;
  @Input() big = false;

  @Input()
  public set disabled(s: boolean) {
    this._disabled = s;
  }

  @Input()
  public set color(color: string) {
    this.colorControl.setValueFrom(color);
    this._color = color;
  }

  @Output()
  public colorChange: EventEmitter<string> = new EventEmitter();

  @Output()
  public closed: EventEmitter<string> = new EventEmitter();

  @HostBinding('style.background-color')
  public get background(): string {
    return this.colorControl.value.toHexString();
  }

  public ngOnInit() {
    this.colorControl.setColorPresets([
      ['#f1485b',
        '#fde7ea', '#fab8bf', '#f68995', '#f2596a',
        '#ef2a40', '#d51026', '#a60d1e', '#760915', '#47050d', '#180204'],
      ['#f44336',
        '#ffebee', '#ffcdd2', '#EF9A9A', '#E57373',
        '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'],
      ['#E6315B',
        '#fc8da7', '#fa7d9a', '#f56484', '#f04a71',
        '#e82c58', '#e31746', '#de0235', '#d60234',
        '#d10232', '#c70230', '#b8022c', '#9c0225',
        '#82011f', '#78011b', '#5c0012', '#4f0010'],
      ['#793183',
        '#ef8dfc', '#eb7dfa', '#e664f5', '#dc4af0',
        '#d22ce8', '#cb17e3', '#c402de', '#bb02d4',
        '#b002c7', '#a202b8', '#8a029c', '#7e018f',
        '#7a018a', '#6c0178', '#5e0169', '#49014f'],
      ['#673AB7',
        '#ede7f6', '#d1c4e9', '#b39ddb', '#9575cd',
        '#7e57c2', '#673ab7', '#5e35b1', '#512da8', '#4527a0', '#311b92'],
      ['#3F51B5',
        '#e8eaf6', '#c5cae9', '#9fa8da', '#7986cb',
        '#5c6bc0', '#3f51b5', '#3949ab', '#303f9f', '#283593', '#1a237e'],
      ['#009DE7',
        '#8dd9fc', '#7dd2fa', '#64c7f5', '#4abbf0',
        '#2cade8', '#17a2e3', '#0298de', '#0291d4',
        '#0289c7', '#027eb8', '#026b9c', '#01628f',
        '#015f8a', '#015278', '#014869', '#01364f'],
      ['#00BCD4',
        '#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1',
        '#26c6da', '#00bcd4', '#00acc1', '#0097a7', '#00838f', '#006064'],
      ['#54d9fc',
        '#e6f9ff', '#b4eefe', '#82e3fd', '#50d8fc',
        '#1dcdfb', '#04b3e2', '#038caf', '#02647d', '#013c4b', '#001419'],
      ['#23dfaf',
        '#e9fcf7', '#bcf5e7', '#90efd7', '#63e8c6',
        '#37e2b6', '#1dc89d', '#179c7a', '#106f57', '#0a4334', '#031611'],
      ['#00B59C',
        '#8dfeea', '#7dfbe4', '#63f4db', '#4befd2',
        '#2de7c6', '#16e2be', '#03deb7', '#01d4ae',
        '#01c7a4', '#01b897', '#019b80', '#019076',
        '#018c73', '#017763', '#016857', '#005044'],
      ['#FFCE00',
        '#fce68d', '#fae17d', '#f5da64', '#f0cf4a',
        '#e8c22c', '#e5bc17', '#deb202', '#d4aa02',
        '#c7a002', '#b89302', '#9c7d02', '#8f7301',
        '#8c7001', '#786201', '#695601', '#4f4100'],
      ['#FF4A21',
        '#fca28d', '#fa947d', '#f57f64', '#f0694a',
        '#e84f2c', '#e33c17', '#de2a02', '#d42902',
        '#c72602', '#b82302', '#9c1e02', '#8f1b01',
        '#8a1a01', '#781701', '#691300', '#4f0e00'],
      ['#D6D5D6',
        '#fff', '#f2f2f2', '#e5e5e5', '#d9d9d9',
        '#cccccc', '#bfbfbf', '#b3b3b3', '#999999',
        '#8c8c8c', '#808080', '#666666', '#595959',
        '#4d4d4d', '#363636', '#262626', '#0f0f0f']
    ]);
    this.colorControl.valueChanges.subscribe((value: Color) => {
      this.colorChange.emit(value.toHexString(true));
      this._color = value.toHexString(true);
    });
  }

  @HostListener('click', ['$event'])
  public showColorPicker(event: MouseEvent) {
    event.stopPropagation();
    if (this.isVisible === true) {
      return;
    } else if (!this._disabled) {
      this.isVisible = !this.isVisible;
    }
  }

  public overlayClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isVisible = false;
    this.closed.emit();
  }
}
