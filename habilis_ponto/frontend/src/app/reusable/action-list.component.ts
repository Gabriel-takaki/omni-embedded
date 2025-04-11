/**
 * Created by filipe on 17/09/16.
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {faCheck, faEdit} from '../../modules/fortawesome-pro-duotone-svg-icons/package';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {MatRipple} from '@angular/material/core';

@Component({
  selector: 'app-action-list',
  templateUrl: 'action-list.component.html',
  styleUrls: ['action-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionListComponent implements OnChanges {

  /**
   * Determina o tipo de lista que é essa, se de evento ou de item
   */
  @Input() isEvent = false;

  /**
   * Indica se será exibida uma imagem ou ícone no início do item
   */
  @Input() showImage = false;
  @Input() imageType: 'url' | 'icon' | 'base64' = 'icon';
  @Input() imageData: string | IconDefinition = '';
  @Input() imageFS = 1.7;

  /**
   * Item está selecionado
   */
  @Input() selected = false;

  /**
   * Lista está em modo de seleção
   */
  @Input() selectionMode = false;

  @Input() showBaseBorder = false;

  @Input() id = '';
  @Input() title: string | {type: string, text: string, color: string, icon: string, group: string}[] = $localize`Teste`;
  @Input() subtitle: string | {type: string, text: string, color: string, icon: string, group: string}[] = $localize`Subtitulo de element`;
  @Input() beginTime = '08:00';
  @Input() endTime = '10:00';
  @Input() showBorder = false;
  @Input() borderColor = '#4caf50';
  @Input() backgroundColor = '#fff';
  @Input() fontColor = '#616161';

  @Input() button1Enabled = false;
  @Input() button1Icon = faEdit;
  @Input() button1Text = $localize`Editar`;
  @Input() button1BgColor = '#33b5e5';
  @Input() button1FgColor = '#fff';

  @Input() button2Enabled = false;
  @Input() button2Icon = faEdit;
  @Input() button2Text = $localize`Editar`;
  @Input() button2BgColor = '#33b5e5';
  @Input() button2FgColor = '#fff';

  @Input() button3Enabled = false;
  @Input() button3Icon = faEdit;
  @Input() button3Text = $localize`Editar`;
  @Input() button3BgColor = '#33b5e5';
  @Input() button3FgColor = '#fff';

  @Input() button4Enabled = false;
  @Input() button4Icon = faCheck;
  @Input() button4Text = $localize`Concluído`;
  @Input() button4BgColor = '#4caf50';
  @Input() button4FgColor = '#fff';

  @Output() onButton1Click = new EventEmitter<string>();
  @Output() onButton2Click = new EventEmitter<string>();
  @Output() onButton3Click = new EventEmitter<string>();
  @Output() onButton4Click = new EventEmitter<string>();

  @Output() onPress = new EventEmitter<string>();
  @Output() onClick = new EventEmitter<string>();

  noTransition = false;
  transform = 0;

  openButton1 = false;
  openButton2 = false;
  openButton3 = false;
  openButton4 = false;

  popButton1 = false;
  popButton2 = false;
  popButton3 = false;
  popButton4 = false;

  direction = '';
  baseColor = '';

  directionTimeout;

  Array = Array;

  @ViewChild(MatRipple, {static: false}) ripple: MatRipple;

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectionMode) {
      this.clearButton();
    }
  }

  panStart(e) {
    if (this.selectionMode || !this.anyButtonEnabled() || !this.checkDirection(e)) {
      return;
    }
    // this.transform = e.deltaX;
    this.noTransition = true;
  }

  panMove(e) {
    if (this.selectionMode || !this.anyButtonEnabled() || !this.checkDirection(e)) {
      return;
    }
    this.transform = e.deltaX;
    if (this.openButton1 || this.openButton4) {
      return;
    }

    // Seta a direção do movimento, cor de fundo e exibição de botões
    if (Math.abs(e.deltaX) > 0) {

      // Se antes do timeout, o usuário começar a mover a aba novamente, limpa o timeout
      if (this.directionTimeout) {
        clearTimeout(this.directionTimeout);
      }

      if (e.deltaX > 0) {
        this.direction = 'right';
        if (this.button2Enabled) {
          this.baseColor = this.button2BgColor;
        } else if (this.button1Enabled) {
          this.baseColor = this.button1BgColor;
        }
      } else {
        this.direction = 'left';
        if (this.button3Enabled) {
          this.baseColor = this.button3BgColor;
        } else if (this.button4Enabled) {
          this.baseColor = this.button4BgColor;
        }
      }

      this.popButton1 = e.deltaX > 90 ? true : false;
      this.popButton2 = e.deltaX > 180 ? true : false;
      this.popButton3 = e.deltaX < -180 ? true : false;
      this.popButton4 = e.deltaX < -90 ? true : false;

    } else {
      this.direction = '';
      this.baseColor = '';
      this.popButton1 = false;
      this.popButton2 = false;
      this.popButton3 = false;
      this.popButton4 = false;
    }

  }

  swipeRight(e) {
    if (this.selectionMode || !this.anyButtonEnabled() || !this.checkDirection(e)) {
      return;
    }
    if (this.openButton4) {
      this.openButton4 = false;
      this.popButton4 = false;
      this.openButton3 = false;
      this.popButton3 = false;
    } else {
      if (this.openButton1 && this.button2Enabled) {
        this.openButton2 = true;
        this.popButton2 = true;
      }
      if (this.button1Enabled) {
        this.openButton1 = true;
        this.popButton1 = true;
      }
    }
  }

  swipeLeft(e) {
    // console.log('swipe left');
    if (this.selectionMode || !this.anyButtonEnabled() || !this.checkDirection(e)) {
      return;
    }
    if (this.openButton1) {
      this.openButton1 = false;
      this.popButton1 = false;
      this.openButton2 = false;
      this.popButton2 = false;
    } else {
      if (this.openButton4 && this.button3Enabled) {
        this.openButton3 = true;
        this.popButton3 = true;
      }
      if (this.button4Enabled) {
        this.openButton4 = true;
        this.popButton4 = true;
      }
    }
  }

  panEnd(e) {
    // console.log('fim do pan');
    if (this.selectionMode || !this.anyButtonEnabled() || !this.checkDirection(e)) {
      return;
    }
    if (Math.abs(e.deltaX) > 90) {
      if (e.deltaX > 0) {
        this.swipeRight(null);
      } else {
        this.swipeLeft(null);
      }
    }
    if (Math.abs(e.deltaX) > 180) {
      if (e.deltaX > 0) {
        this.swipeRight(null);
      } else {
        this.swipeLeft(null);
      }
    }

    // A limpeza da variável tem que sofrer um delay por causa da animação
    this.directionTimeout = setTimeout(() => {
      this.direction = '';
    }, 500);
  }

  touchEnd(e) {
    this.transform = 0;
    this.noTransition = false;
  }

  checkDirection(e) {
    return e && e.offsetDirection ? (e.offsetDirection === 2 || e.offsetDirection === 4 || e.offsetDirection === 24) : true;
  }

  isCleared() {
    return (!this.openButton1 && !this.openButton2 && !this.openButton3 && !this.openButton4);
  }

  clearButton() {
    this.openButton1 = false;
    this.openButton2 = false;
    this.openButton3 = false;
    this.openButton4 = false;

    this.popButton1 = false;
    this.popButton2 = false;
    this.popButton3 = false;
    this.popButton4 = false;

    this.transform = 0;
    this.noTransition = false;
  }

  buttonClick(button) {
    this.clearButton();
    this['onButton' + button + 'Click'].emit(this.id);
  }

  anyButtonEnabled() {
    return this.button1Enabled || this.button2Enabled || this.button3Enabled || this.button4Enabled;
  }

  click(e) {

    if (this.isCleared()) {

      if (!this.selectionMode) {
        const rippleRef = this.ripple.launch(e.offsetX, e.offsetY);

        setTimeout(() => {
          rippleRef.fadeOut();
        }, 200);
      }

      this.onClick.emit(this.id);

    } else {
      this.clearButton();
    }

  }

  press() {
    this.onPress.emit(this.id);
  }

}
