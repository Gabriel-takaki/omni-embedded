import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventsService } from './events.service';
import { SocketService } from './socket.service';
import { StatusService } from './status.service';
import { BASE_URL } from '../app.consts';
import { NotificationsService } from 'angular2-notifications';

export interface ClockinState {
    inclockin: boolean;
    clockinStart?: Date;
    registerMethod?: 'photo' | 'location' | 'password';
}

export interface ClockinUserActualStatus {
    inclockin: boolean;
    actualClockin: any;
    totalhoursweek: any;
    weekDaysStatus: any;
}

@Injectable({
    providedIn: 'root'
})
export class ClockinService {

    public clockinState: ClockinState = {} as ClockinState;


    constructor(private http: HttpClient, private socketService: SocketService, private status: StatusService,
        private eventsService: EventsService, public notifications: NotificationsService) {
    }


    async registerClockIn(registerMethod: string, currentDate: Date): Promise<{ success: boolean, starttime?: Date, error?: string }> {
        let intMethod = 0;

        switch (registerMethod) {
            case 'password':
                intMethod = 1;
                break;
            case 'location':
                intMethod = 2;
                break;
            // Note: The duplicate 'password' case was removed, as it would never be reached
            // case 'password':
            //   intMethod = 3;
            //   break;
        }

        const body = {
            registerMethod: intMethod,
            starttime: currentDate,
            action: 1,
        };

        try {
            const response = await this.http.post(`${BASE_URL}/clockin/registerClockIn`, body, {
                observe: "response"
            }).toPromise();

            console.log(response);

            if (response.status === 200) {
                this.updateClockinState()
                this.eventsService.emit('clockin');
                return { success: true, starttime: body.starttime };
            } else if (response.status === 400) {
                return { success: false, error: 'Erro ao registrar ponto' };
            } else if (response.status === 405) {
                return { success: false, error: 'Você já está registrado' };
            }

            return { success: false, error: 'Erro desconhecido' };
        } catch (err) {
            if (err.status === 400) {
                return { success: false, error: 'Erro ao registrar ponto' };
            } else if (err.status === 405) {
                return { success: false, error: 'Você já está registrado' };
            }

            return { success: false, error: 'Erro na conexão' };
        }
    }

    async registerClockOut  (registerMethod: string, currentDate: Date): Promise<{ success: boolean, error?: string, endtime?: Date }> {
        let intMethod = 0;

        switch (registerMethod) {
            case 'password':
                intMethod = 1;
                break;
            case 'location':
                intMethod = 2;
                break;
            // Note: The duplicate 'password' case was removed, as it would never be reached
            // case 'password':
            //   intMethod = 3;
            //   break;
        }

        const body = {
            registerMethod: intMethod,
            starttime: currentDate,
            action: 2,
          }

        try {
            const response = await this.http.post(`${BASE_URL}/clockin/registerClockOut`, body, {
                observe: "response"
            }).toPromise();

            console.log(response);

            if (response.status === 200) {
                this.updateClockinState()
                return { success: true, endtime: body.starttime };
            } else if (response.status === 400) {
                return { success: false, error: 'Erro ao registrar ponto' };
            } else if (response.status === 405) {
                return { success: false, error: 'Você já está registrado' };
            }

            return { success: false, error: 'Erro desconhecido' };
        } catch (err) {
            if (err.status === 400) {
                return { success: false, error: 'Erro ao registrar ponto' };
            } else if (err.status === 405) {
                return { success: false, error: 'Você já está registrado' };
            }

            return { success: false, error: 'Erro na conexão' };
        }
    }

    async updateClockinState(){
        // atualiza o estado de clockin
        this.http.get(BASE_URL + '/clockin/getClockinState').subscribe((r: any) => {
            // TODO verificar porque nao consigo checar o status da response (200, 400, 405)
            console.log(r)

            switch (r.registerMethod) {
                case 0:
                    this.clockinState.registerMethod = 'password';
                    break;
                case 1:
                    this.clockinState.registerMethod = 'location';
                    break;
                case 2:
                    this.clockinState.registerMethod = 'photo';
                    break;
            }

            if (r.inclockin) {
                this.clockinState.inclockin = r.inclockin;
                this.clockinState.clockinStart = r.lastClockin.starttime;
                // this.clockinState.registerMethod = r.lastClockin.registerMethod;


                return this.clockinState;
            }

            this.clockinState.inclockin = r.inclockin;
            return this.clockinState;

        }, err => {
            // trata o erro 
            console.log(err)
            this.notifications.error($localize`:@@error:Erro`, $localize`:@@errorGettingClockinState:Erro ao obter estado de ponto`);
        }
        );
    }

    getClockinState(): Promise<ClockinState> {
        // Check if clockinState is already loaded
        if (this.clockinState.inclockin !== undefined) {
          console.log('Using cached clockin state');
          return Promise.resolve(this.clockinState);
        }
        
        console.log('Fetching clockin state from server');
        return new Promise((resolve, reject) => {
          this.http.get(BASE_URL + '/clockin/getClockinState').subscribe(
            (r: any) => {
              const state: ClockinState = {
                inclockin: r.inclockin,
                registerMethod: this.mapRegisterMethod(r.registerMethod),
              };
              
              if (r.inclockin && r.lastClockin) {
                state.clockinStart = r.lastClockin.starttime;
              }
              
              this.clockinState = state;
              resolve(this.clockinState);
            },
            err => {
              console.error(err);
              this.notifications.error($localize`:@@error:Erro`, 
                $localize`:@@errorGettingClockinState:Erro ao obter estado de ponto`);
              reject(err);
            }
          );
        });
      }

    mapRegisterMethod(registerMethod: number): 'password' | 'location' | 'photo' {
        switch (registerMethod) {
            case 0:
                return 'password';
            case 1:
                return 'location';
            case 2:
                return 'photo';
        }
    }


    async getUserActualStatus(): Promise<ClockinUserActualStatus>{    
        return new Promise((resolve, reject) => {
            this.http.get(BASE_URL + '/clockin/getUserActualStatus').subscribe(
                (r: any) => {
                    const status: ClockinUserActualStatus = {
                        inclockin: r.inclockin,
                        actualClockin: r.actualClockin,
                        totalhoursweek: r.totalhoursweek,
                        weekDaysStatus: r.weekDaysStatus
                    };
                    resolve(status);
                },
                err => {
                    console.error(err);
                    this.notifications.error($localize`:@@error:Erro`, 
                        $localize`:@@errorGettingUserActualStatus:Erro ao obter estado atual do usuário`);
                    reject(err);
                }
            );
        });
    }

    async getRegisters(data: any): Promise<any>{
        // verifica o tipo de usuário
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/clockin/getRegistersReportView', data).subscribe(
                (r: any) => {
                    resolve(r);
                },
                err => {
                    console.error(err);
                    this.notifications.error($localize`:@@error:Erro`, 
                        $localize`:@@errorGettingRegisters:Erro ao obter registros de ponto`);
                    reject(err);
                }
            );
        });
    }

    async exportRegisters(data: any): Promise<any>{
        let url = ''
        switch (data.exportType){
            case 1: 
            url = 'getRegistersReportPdf'
        }

        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + `/clockin/${url}`, data).subscribe(
                (r: any) => {
                    resolve(r);
                },
                err => {
                    console.error(err);
                    this.notifications.error($localize`:@@error:Erro`, 
                        $localize`:@@errorGettingRegisters:Erro ao obter registros de ponto`);
                    reject(err);
                }
            );
        });
    }

    async getClockinHistory() { }

    async clockinByPicture() {
        // 
    }

}