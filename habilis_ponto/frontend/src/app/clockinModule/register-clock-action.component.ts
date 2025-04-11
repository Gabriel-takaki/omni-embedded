import { trigger, state, style, animate, transition } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClockInDialogComponent } from './clock-in-dialog.component';
import { ClockinService, ClockinState } from 'app/services/clockin.service';

@Component({
  selector: 'ca-register-clock-action',
  templateUrl: './register-clock-action.component.html',
  styleUrls: ['./register-clock-action.component.scss'],
  animations: [
    trigger('animationState', [
      state('in', style({
        backgroundColor: '#4CAF50',
        transform: 'scale(1)'
      })),
      state('out', style({
        backgroundColor: '#F44336',
        transform: 'scale(1)'
      })),
      state('loading', style({
        transform: 'scale(1.2)'
      })),
      transition('* => loading', [
        animate('300ms ease-in')
      ]),
      transition('loading => *', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class RegisterClockActionComponent implements OnInit {

  public clockinState:  ClockinState  = {} as ClockinState;

  constructor(private dialog: MatDialog, private clockinS: ClockinService){
    this.getClockinState();

  }



  ngOnInit(): void {
      // checa o stado atual do usuário
  }


  async getClockinState(){
    this.clockinState = await this.clockinS.getClockinState();
    console.log(this.clockinState);
  }

  inClockin: boolean = false
  animationState: string = 'out'

  registerClock(inclockin: boolean = false) {
    // const tipoRegistro = this.inClockin ? 'saida' : 'entrada';
    
    const dialogRef = this.dialog.open(ClockInDialogComponent, {
      width: '400px',
      // data: { method: 'photo', registerClockout: this.inClockin }
      // data: { tipo: tipoRegistro }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result.success) {
        // Iniciar animação
        this.getClockinState()
        console.log(console.log(this.clockinState));
        this.animationState = 'loading';
        
        setTimeout(() => {
          this.inClockin = !this.inClockin;
          this.animationState = this.inClockin ? 'in' : 'out';
        }, 300);
      }
    });
  }
  
  getTextoSlide(): string {
    return this.inClockin ? 'Registrar Saída' : 'Registrar Entrada';
  }

}
