// clockin-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { BASE_URL } from 'app/app.consts';
import { DxDataGridComponent } from 'devextreme-angular';
import { StatusService } from 'app/services/status.service';
import { NotificationsService } from 'angular2-notifications';
import { ClockinService } from 'app/services/clockin.service';
// import { ReportDialogComponent } from '../report-dialog/report-dialog.component';

// Enum for record types matching the backend
enum ClockInType {
  CLOCK_IN = 1,
  CLOCK_OUT = 2,
  CORRECTION = 3
}

// Enum for register methods
enum RegisterMethod {
  PASSWORD = 1,
  PHOTO = 2,
  LOCATION = 3
}

// Interface matching the backend response
interface ClockoutRecord {
  id: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: {
    durationString: string;
    durationHours: number;
    durationMinutes: number;
    totalMinutes: number;
  };
  registerMethod: number;
  hash?: string;
  previousHash?: string;
}

interface ClockoutResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
  summary: {
    recordCount: number;
    totalDuration: {
      hours: number;
      minutes: number;
      formatted: string;
    };
    periodStart: string;
    periodEnd: string;
  };
  results: ClockoutRecord[];
}

interface Employee {
  id: number;
  name: string;
}

@Component({
  selector: 'ca-clockinlist',
  templateUrl: './clockinlist.component.html',
  styleUrls: ['./clockinlist.component.scss'],
  providers: [DatePipe]
})
export class ClockinlistComponent implements OnInit {

    @ViewChild('dxgrid') grid: DxDataGridComponent;

loadDetails($event: any) {
throw new Error('Method not implemented.');
}
  displayedColumns: string[] = ['employeeName', 'date', 'time', 'duration', 'registerMethod', 'actions'];
  dataSource = new MatTableDataSource<ClockoutRecord>([]);
  filterForm: FormGroup;
  employees: Employee[] = [];
  
  // Pagination variables
  currentPage = 1;
  pageSize = 20;
  totalRecords = 0;
  totalPages = 0;
  
  // Summary data
  summary = {
    recordCount: 0,
    totalDuration: {
      hours: 0,
      minutes: 0,
      formatted: '0h 0m'
    },
    periodStart: '',
    periodEnd: ''
  };
  
  // Enums available in template
  recordTypes = ClockInType;
  registerMethods = RegisterMethod;
  
  isLoading = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
period: any;
public startDate = new Date();
public endDate = new Date();
public today = new Date();
userSelected: any;

users = []

public columns = [
  {caption: $localize`Usuário`, dataField: 'userName', cssClass: 'pad5A'},
  {caption: $localize`Duração`, dataField: 'totalTime', cssClass: 'pad5A'},
  {caption: $localize`Entrada`, dataField: 'startDate', cssClass: 'pad5A'},
  {caption: $localize`Saída`, dataField: 'finishDate', cssClass: 'pad5A'},
  {caption: $localize`Método`, dataField: 'registerMethod', cssClass: 'pad5A'},
  {caption: $localize`Ações`, cellTemplate: 'viewButtonTemplate', cssClass: 'pad5A', width: 100}
];

localItems: any;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private http: HttpClient,
    public statusService: StatusService,
    public notifications: NotificationsService,
    private clockinService: ClockinService
  ) {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // 30 days including today
    this.period = 3;
    this.userSelected = 505;
    
    // Initialize filter form
    this.filterForm = this.fb.group({
      dateRange: [{ start: startDate, end: endDate }],
      employee: [''],
      page: [1],
      limit: [20]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadData();
    
    // Subscribe to form changes to reload data
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1; // Reset to first page on filter change
      this.filterForm.get('page').setValue(1, { emitEvent: false });
      this.loadData();
    });

    console.log(this.statusService.allUsers)
  }

  ngAfterViewInit(): void {
    // Use Angular Material's paginator instead of implementing our own
    this.paginator.page.subscribe((event) => {
      this.currentPage = event.pageIndex + 1;
      this.pageSize = event.pageSize;
      this.filterForm.get('page').setValue(this.currentPage, { emitEvent: false });
      this.filterForm.get('limit').setValue(this.pageSize, { emitEvent: false });
      this.loadClockoutRecords();
    });
    
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    console.log('Carregando usuários');
    this.http.get(BASE_URL + '/users/?status=1&limit=500').subscribe((r: any[]) => {
      console.log(r);
      this.users = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  exportData(exportType: number){
    console.log('Exportando dados');
    const data = {
      startDate: this.startDate,
      endDate: this.endDate,
      userId: this.userSelected,
      exportType: exportType
    }
    this.clockinService.exportRegisters(data).then((response: any) => {
      console.log(response)
    })
  }
  
  loadData() {

    switch (this.period) {
      case 1:
        this.startDate = new Date();
        this.endDate = new Date();
        break;
      case 2:
        this.startDate = moment().startOf('week').toDate();
        this.endDate = moment().toDate();
        break;
      case 3:
        this.startDate = moment().startOf('month').toDate();
        this.endDate = moment().toDate();
        break;
    }

    const data = {
      startDate: this.startDate,
      endDate: this.endDate,
      userId: this.userSelected,
    }
    
    try{
      this.clockinService.getRegisters(data).then((response: any) => {
        console.log(response)
        this.localItems = response.data
      })
    }
    catch(err){

    }
      // if (this.grid) {
      //   this.grid.instance.beginCustomLoading($localize`Carregando`);
      // }
  
      // if (this.period === 1) {
      //   this.startDate = new Date();
      //   this.endDate = new Date();
      // } else if (this.period === 2) {
      //   this.startDate = moment().startOf('week').toDate();
      //   this.endDate = moment().toDate();
      // } else if (this.period === 3) {
      //   this.startDate = moment().startOf('month').toDate();
      //   this.endDate = moment().toDate();
      // }
  
      // this.http.post(BASE_URL + '/reports/getAgentsPausedTimes', {
      //   startDate: this.startDate,
      //   endDate: this.endDate
      // }).subscribe((r: any) => {
      //   // this.columns = JSON.parse(JSON.stringify(this.baseColumns));
      //   const tmpColumns = [];
      //   for (const c of r.columns) {
      //     tmpColumns.push({
      //       caption: c.caption,
      //       dataField: c.dataField + '.pausedtime',
      //       dataType: 'number',
      //       alignment: 'center',
      //       cellTemplate: 'pauseTemplate',
      //       headerCellTemplate: 'smallHeaderTemplate',
      //       cssClass: 'pad5A'
      //     });
      //   }
      //   tmpColumns.push({
      //     caption: $localize`Total`,
      //     dataField: 'totalpausedtime',
      //     dataType: 'number',
      //     alignment: 'center',
      //     cellTemplate: 'boldTimeTemplate',
      //     headerCellTemplate: 'boldHeaderTemplate',
      //     cssClass: 'pad5A'
      //   });
      //   // this.columns.push({caption: 'Pausas', alignmente: 'center', columns: tmpColumns});
  
      //   this.localItems = r.result;
  
      //   if (this.grid) {
      //     this.grid.instance.endCustomLoading();
      //   }
  
      // }, err => {
      //   // this.notifications.error($localize`Erro`, $localize`Erro ao carregar dados!`);
      // });
  
    }

  loadClockoutRecords(): void {
    // this.isLoading = true;
    // const filterValues = this.filterForm.value;
    
    // // Format date range for API
    // const startDate = moment(filterValues.dateRange.start).format('YYYY-MM-DD');
    // const endDate = moment(filterValues.dateRange.end).format('YYYY-MM-DD');
    
    // // Build query parameters
    // let params: any = {
    //   startDate,
    //   endDate,
    //   page: filterValues.page,
    //   limit: filterValues.limit
    // };
    
    // // Add employee filter if selected
    // if (filterValues.employee) {
    //   params.userId = filterValues.employee;
    // }
    
    // // Make API request
    // this.http.get<ClockoutResponse>(`${BASE_URL}/clockin/getRegistersByDate`, { params })
    //   .subscribe(
    //     (response) => {
    //       if (response.success) {
    //         this.dataSource.data = response.results;
            
    //         // Update pagination info
    //         this.totalRecords = response.pagination.totalRecords;
    //         this.totalPages = response.pagination.totalPages;
            
    //         // Update summary
    //         this.summary = response.summary;
            
    //         // Update paginator without triggering another load
    //         if (this.paginator) {
    //           this.paginator.length = this.totalRecords;
    //           this.paginator.pageIndex = this.currentPage - 1;
    //           this.paginator.pageSize = this.pageSize;
    //         }
    //       } else {
    //         console.error('API returned error:', response);
    //       }
    //       this.isLoading = false;
    //     },
    //     (error) => {
    //       console.error('Error fetching clockout records:', error);
    //       this.isLoading = false;
    //     }
    //   );
    const filterData = {
      startDate: this.startDate,
      endDate: this.endDate,
      user: this.userSelected,
    }
    try{
      this.clockinService.getRegisters(filterData).then((response: any) => {
        console.log(response)
      })
    }
    catch(err){

    }
  }

  getEmployeeName(userId: number): string {
    const employee = this.employees.find(emp => emp.id === userId);
    return employee ? employee.name : `User ${userId}`;
  }

  getRegisterMethodLabel(method: RegisterMethod): string {
    switch (method) {
      case RegisterMethod.PASSWORD: return 'Password';
      case RegisterMethod.PHOTO: return 'Photo';
      case RegisterMethod.LOCATION: return 'Location';
      default: return 'Unknown';
    }
  }

  openReportDialog(): void {
    // const dialogRef = this.dialog.open(ReportDialogComponent, {
    //   width: '500px',
    //   data: {
    //     dateRange: this.filterForm.value.dateRange,
    //     employeeId: this.filterForm.value.employee,
    //     summary: this.summary
    //   }
    // });
    //
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     // Logic to generate report with returned parameters
    //     console.log('Generating report:', result);
    //   }
    // });
  }

  onPageChange(event): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.filterForm.get('page').setValue(this.currentPage, { emitEvent: false });
    this.filterForm.get('limit').setValue(this.pageSize, { emitEvent: false });
    this.loadClockoutRecords();
  }
}