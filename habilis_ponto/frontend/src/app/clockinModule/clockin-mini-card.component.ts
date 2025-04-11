import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BASE_URL } from 'app/app.consts';
import { ClockinService } from 'app/services/clockin.service';
import { StatusService } from 'app/services/status.service';
import { interval, Subscription } from 'rxjs';

interface WorkRecord {
  date: Date;
  startTime: Date;
  endTime?: Date;
  method: string;
}

interface WeekDayStatus {
  [key: string]: boolean;
}

interface ClockinResponse {
  inclockin: boolean;
  actualClockin: Array<{
    fk_user: number;
    action: number;
    registerMethod: number;
    starttime: string;
    endtime: string | null;
    id: number;
    createdAt: string;
    updatedAt: string;
  }>;
  totalhoursweek: number;
  weekDaysStatus: Array<WeekDayStatus>;
}

@Component({
  selector: 'ca-clockin-mini-card',
  templateUrl: './clockin-mini-card.component.html',
  styleUrls: ['./clockin-mini-card.component.scss']
})


export class ClockinMiniCardComponent implements OnInit, OnDestroy {


  
  changeSubscription: Subscription; 
  isCurrentlyWorking = false;
  currentJourneyStart = new Date();
  lastJourneyEnd = new Date();
  registrationMethod = '';
  weeklyHours = 0;

  journeyDuration = {
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  weekDays: string[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  activeWeekDays: boolean[] = [false, false, false, false, false, false, false];
  recentRecords: WorkRecord[] = [];

  private durationSubscription?: Subscription;
  private clockinData?: ClockinResponse;

  constructor(private http: HttpClient, private clockinService: ClockinService, private status: StatusService) {
    
    this.changeSubscription = status.events.subscribe((e) => {
      if (e == 'clockin') {
          this.getUserActualStatus();
      }
  });


  }

  ngOnInit() {
    this.getUserActualStatus();
  }

  ngOnDestroy() {
    this.durationSubscription?.unsubscribe();
    this.changeSubscription.unsubscribe();

  }

  private startJourneyDurationCounter() {
    if (this.isCurrentlyWorking) {
      this.durationSubscription?.unsubscribe();
      
      this.durationSubscription = interval(1000).subscribe(() => {
        const now = new Date();
        const diff = now.getTime() - this.currentJourneyStart.getTime();

        this.journeyDuration = {
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
      });
    }
  }

  getUserActualStatus() {
    this.clockinService.getUserActualStatus().then(
      (response: ClockinResponse) => {
        this.clockinData = response;
        this.processClockInData(response);
      },
      (error) => {
        console.error('Erro ao buscar status do usuário:', error);
      }
    );
  }

  private processClockInData(data: ClockinResponse) {
    // Verifica se o usuário está em jornada de trabalho
    this.isCurrentlyWorking = data.inclockin;
    
    // Processa os dados de clockin atual
    if (data.actualClockin && data.actualClockin.length > 0) {
      const currentClockin = data.actualClockin[0];
      
      // Define o método de registro (1 = 'photo', 2 = 'geolocation')
      this.registrationMethod = currentClockin.registerMethod === 1 ? 'photo' : 'geolocation';
      
      // Define o horário de início da jornada atual
      this.currentJourneyStart = new Date(currentClockin.starttime);
      
      // Inicia o contador se estiver em jornada
      if (this.isCurrentlyWorking) {
        this.startJourneyDurationCounter();
      }
      
      // Se não estiver em jornada, mas tiver um endtime, define o horário de término
      if (!this.isCurrentlyWorking && currentClockin.endtime) {
        this.lastJourneyEnd = new Date(currentClockin.endtime);
      }
    }
    
    // Define as horas semanais
    this.weeklyHours = data.totalhoursweek;
    
    // Processa os dias da semana ativos
    if (data.weekDaysStatus && data.weekDaysStatus.length === 7) {
      this.activeWeekDays = data.weekDaysStatus.map(dayStatus => {
        const day = Object.keys(dayStatus)[0];
        return dayStatus[day];
      });
    }
    
    // Aqui você poderia buscar os registros recentes com outra chamada API
    // Por enquanto, vamos manter os dados de exemplo, mas adaptados para o formato correto
    this.recentRecords = [
      { 
        date: new Date(), 
        startTime: this.currentJourneyStart, 
        endTime: this.isCurrentlyWorking ? undefined : this.lastJourneyEnd,
        method: this.registrationMethod
      }
    ];
  }

  getMethodIcon(method: string): string {
    return method === 'photo' ? 'camera_alt' : 'location_on';
  }

  getDayOfWeek(index: number): string {
    return this.weekDays[index];
  }

  isDayActive(index: number): boolean {
    return this.activeWeekDays[index];
  }
}