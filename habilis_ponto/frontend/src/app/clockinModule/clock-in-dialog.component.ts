import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationsService } from 'angular2-notifications';
import { BASE_URL } from 'app/app.consts';
import { ClockinService } from 'app/services/clockin.service';
import { GeolocationService } from 'app/services/geolocation.service';
import { StatusService } from 'app/services/status.service';

export type ClockInMethod = 'photo' | 'location' | 'password';

export interface ClockInDialogData {
  method: ClockInMethod;
  requiredPassword?: string;
}

@Component({
  selector: 'ca-clock-in-dialog',
  templateUrl: './clock-in-dialog.component.html',
  styleUrls: ['./clock-in-dialog.component.scss']
})


export class ClockInDialogComponent implements OnInit {

  registerMethod: any;
  registerClockout: boolean = false;
  loading = false;
  error: string | null = null;
  
  // pra registro por foto
  videoStream: MediaStream | null = null;
  videoElement: HTMLVideoElement | null = null;
  capturedImage: string | null = null;
  cameraReady = false;
  
  // por loxalização
  currentLocation: GeolocationPosition | null = null;
  locationError: string | null = null;

  // pra registro por senha
  passwordForm: FormGroup;
  
  // Date and time
  currentDate = new Date();

  constructor(
    private dialogRef: MatDialogRef<ClockInDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClockInDialogData,
    private fb: FormBuilder,
    private geoService: GeolocationService,
    private http: HttpClient, public status : StatusService, public clockinService: ClockinService, public notification: NotificationsService
  ) { 
    // this.currentMethod = data.method;
    // this.registerClockout = data.registerClockout;
    // this.passwordForm = this.fb.group({
    //   password: ['', Validators.required]
    // });

  }

  ngOnInit(): void {
    this.getClockinState()


    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }


  async getClockinState(){
    const clockinResponse = await this.clockinService.getClockinState()

    if(clockinResponse.inclockin){
      this.registerClockout = true;
    }

    console.log(clockinResponse);

    this.registerMethod = clockinResponse.registerMethod 
        switch (clockinResponse.registerMethod) {
      case 'photo':
        this.initCamera();
        break;
      case 'location':
        this.requestLocation();
        break;
      case 'password':
        // Password form is already initialized
        break;
    }
  }


  async initCamera(): Promise<void> {
    try {
      this.loading = true;
      
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setTimeout(() => {
        this.videoElement = document.querySelector('video');
        if (this.videoElement) {
          this.videoElement.srcObject = this.videoStream;
          this.videoElement.onloadedmetadata = () => {
            this.cameraReady = true;
            this.loading = false;
          };
        }
      }, 100);
    } catch (err) {
      this.error = 'Camera access denied or not available';
      this.loading = false;
      console.error('Camera error:', err);
    }
  }

  stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  capturePhoto(): void {
    if (!this.videoElement) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL('image/png');
      this.stopCamera();
      
      // Here you would typically send the image to your backend
      // for processing (face recognition, etc.)
      this.loading = true;
      
      // Simulate processing time
      setTimeout(() => {
        this.validatePhotoAndRegister();
      }, 1500);
    }
  }
  
  validatePhotoAndRegister(): void {
    // In a real application, this would be where you receive 
    // confirmation from your backend that the face was recognized
    this.loading = false;
    // this.processClockIn('photo');

   
  }
  
  retakePhoto(): void {
    this.capturedImage = null;
    this.initCamera();
  }



  requestLocation(): void {
    this.loading = true;
    this.geoService.getCurrentPosition()
      .then(position => {
        this.currentLocation = position;
        this.loading = false;
        // Automatically process clock-in once location is obtained
        // this.processClockIn('location');
      })
      .catch(error => {
        this.locationError = 'Unable to get your location. Please check permissions.';
        this.loading = false;
        console.error('Geolocation error:', error);
      });
  }

  processClockIn(method: ClockInMethod): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.dialogRef.close({
        success: true,
        method: method,
        timestamp: new Date(),
        data: method === 'photo' ? this.capturedImage : 
              method === 'location' ? this.currentLocation : 
              'password-validated'
      });
    }, 1500);
  }

  registerEntry() {
    this.clockinService.registerClockIn(this.registerMethod, this.currentDate)
      .then(result => {
        if (result.success) {
          this.status.user = {
            ...this.status.user,
            clockin: true
          };
          this.notification.success($localize`Sucesso`, $localize`Início de jornada registrado !` )
          this.dialogRef.close({ success: true, starttime: result.starttime });
        } else {
          this.error = result.error;
        }
      });
  }

  registerOut(){

    this.clockinService.registerClockOut(this.registerMethod, this.currentDate)
      .then(result => {
        if (result.success) {
          this.status.user = {
            ...this.status.user,
            clockin: false
          };
          this.notification.success($localize`Sucesso`, $localize`Saida de jornada registrada !` )
          this.dialogRef.close({ success: true, endtime: result.endtime });
        } else {
          this.error = result.error;
        }
      }
    )
    
    // let intMethod = 0

    // switch(this.registerMethod){
    //   case 'password':
    //     intMethod = 1;
    //     break;
    //   case 'location':
    //     intMethod = 2;
    //     break;
    //   case 'password':
    //     intMethod = 3;
    //     break;
    // }
  
    //   const body = {
    //     registerMethod: intMethod,
    //     starttime: this.currentDate,
    //     action: 2,
    //   }
  
    //   this.http.post(`${BASE_URL}/clockin/registerClockOut`, body, {
    //               observe: "response"
    //           }).subscribe(r => {
    //             console.log(r);
    //             switch(r.status){
    //               case 200:
    //                 this.status.user = {
    //                   ...this.status.user,
    //                   clockin: false
    //                 }
    //                 this.dialogRef.close({ success: true });
    //                 break;
    //               case 400:
    //                 this.error = 'Erro ao registrar saida de ponto';
    //                 break;
    //               case 405:
    //                 this.error = 'Você não está registrado para sair';
    //                 break;
    //               case 406:
    //                 this.error = 'Ínicio de jornada não registrado';
    //                 break;
    //             }
    //           }, err => {
    //             switch(err.status){
    //               case 400:
    //                 this.error = 'Erro ao registrar ponto';
    //                 break;
    //               case 405:
    //                 this.error = 'Você não está registrado';
    //                 break;
    //                 case 406:
    //                   this.error = 'Ínicio de jornada não registrado';
    //                   break;
    //             }
    //           });
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }
  

}
