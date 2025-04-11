/**
 * Created by filipe on 18/09/16.
 */
import {Component, EventEmitter, Input, Output} from "@angular/core";
import {StatusService} from "../services/status.service";
import {MatDialog} from "@angular/material/dialog";
import {SelectLocationDialogComponent} from "./select-location-dialog.component";

@Component({
  selector: 'app-select-location',
  templateUrl: './select-location.component.html',
  styleUrls: ['./select-location.component.scss'],
})
export class SelectLocationComponent {

  @Input() formattedLocation = '';
  @Output() formattedLocationChange = new EventEmitter<string>();
  @Input() fontSize: any = 12;
  @Input() editable = false;
  @Input() showIcon = false;
  @Output() changed: EventEmitter<any> = new EventEmitter();

  constructor(public status: StatusService, private dialog: MatDialog) {
  }

  openSelectionDialog() {
    const sub = this.dialog.open(SelectLocationDialogComponent).afterClosed().subscribe(sc => {
      if (sc?.properties) {
        console.log(sc);
        this.formattedLocationChange.emit(sc.properties.formatted);
        this.changed.emit(sc);
      }
      sub.unsubscribe();
    });
  }

  clearLocation(e){
    this.formattedLocationChange.emit('');
    this.changed.emit('');
    e.stopPropagation();
    e.preventDefault();
  }

}
