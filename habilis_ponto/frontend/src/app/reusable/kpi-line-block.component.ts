/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-kpi-line-block',
  templateUrl: 'kpi-line-block.component.html',
  styleUrls: ['kpi-line-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiLineBlockComponent {

  @Input() title = '';
  @Input() digitsInfo = '';
  @Input() value: number|string = 0;
  @Input() diff = 0;
  @Input() diffDirection = 0;
  @Input() hidePercent = false;
  @Input() onlyText = false;
  @Input() showDollarSign = false;

  constructor() {

  }

}
