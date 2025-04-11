// clockin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatusService } from 'app/services/status.service';

export interface Notification {
  id: number;
  userId: number;
  userImage: string;
  userName: string;
  type: 'absence' | 'overtime' | 'late' | 'other';
  date: Date;
  description: string;
}

interface Employee {
  name: string;
  department: string;
  attendance: string;
  overtime: string;
  lateCount: number;
  workingHours: number;
  absences: number;
  status: 'normal' | 'warning' | 'critical';
}

interface Alert {
  type: 'warning' | 'critical';
  message: string;
  employee?: string;
  department?: string;
}

@Component({
  selector: 'ca-clockindashboard',
  templateUrl: './clockindashboard.component.html',
  styleUrls: ['./clockindashboard.component.scss']
})
export class ClockindashboardComponent implements OnInit {
  // Dados para gráficos
  attendanceData: ChartData<'bar'> = {
    labels: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    datasets: [
      { data: [95, 97, 94, 92, 90], label: 'Taxa de Presença (%)' }
    ]
  };

  hoursWorkedData: ChartData<'line'> = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      { data: [160, 165, 168, 162, 170, 168], label: 'Horas Trabalhadas' },
      { data: [168, 168, 168, 160, 168, 160], label: 'Horas Esperadas' }
    ]
  };

  overtimeData: ChartData<'pie'> = {
    labels: ['Horas Normais', 'Horas Extras'],
    datasets: [
      { data: [85, 15] }
    ]
  };

  absenceData: ChartData<'line'> = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      { data: [3.2, 2.8, 4.1, 3.7, 2.5, 2.9], label: 'Taxa de Ausência (%)' }
    ]
  };

  // Limites de horas trabalhadas
  workingHoursLimits = {
    min: 160,  // Mínimo esperado por mês
    max: 180,  // Máximo permitido por mês
    daily: {
      min: 6,  // Mínimo diário
      max: 10  // Máximo diário
    }
  };

  // Dados para tabela de colaboradores
  public notifications: Notification[] = [
    {
      id: 1,
      userId: 101,
      userImage: 'assets/avatars/user1.jpg',
      userName: 'Carlos Silva',
      type: 'absence',
      date: new Date('2025-04-05'),
      description: 'Apresentou falta com atestado médico'
    },
    {
      id: 2,
      userId: 102,
      userImage: 'assets/avatars/user2.jpg',
      userName: 'Ana Pereira',
      type: 'overtime',
      date: new Date('2025-04-06'),
      description: 'Estourou limite de horas semanais'
    },
    {
      id: 3,
      userId: 103,
      userImage: 'assets/avatars/user3.jpg',
      userName: 'Roberto Alves',
      type: 'late',
      date: new Date('2025-04-07'),
      description: 'Registrou mais de 3 atrasos na semana'
    }
  ];


  // Configurações dos gráficos
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        min: 80
      }
    }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true
  };

  // Dados de métricas principais
  kpiData = {
    averageAttendance: '94%',
    totalOvertime: '48h',
    lateEmployees: '12%',
    absentEmployees: '3%',
    totalAbsences: 12,
    employeesOverMax: 2,
    employeesUnderMin: 1
  };

  // Alertas ativos
  alerts: Alert[] = [
    { type: 'critical', message: 'Juliana Oliveira excedeu o limite máximo de horas (185h)', employee: 'Juliana Oliveira', department: 'Marketing' },
    { type: 'warning', message: 'Carlos Santos abaixo do mínimo de horas (158h)', employee: 'Carlos Santos', department: 'RH' },
    { type: 'warning', message: 'Mariana Costa com 3 atrasos no mês', employee: 'Mariana Costa', department: 'Operações' },
    { type: 'critical', message: 'Taxa de ausência acima de 3% no departamento de Marketing', department: 'Marketing' },
    { type: 'warning', message: '5 colaboradores com jornada estendida (>9h) na última semana' }
  ];

  // Meses para filtro
  months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Departamentos para filtro
  departments = ['Todos', 'TI', 'RH', 'Marketing', 'Financeiro', 'Operações'];

  selectedMonth = 'Junho';
  selectedDepartment = 'Todos';
  
  // Colunas para exibição na tabela
  displayedColumns: string[] = ['name', 'department', 'attendance', 'workingHours', 'overtime', 'lateCount', 'absences', 'status', 'actions'];

  period 

  dashToogle = 0;
  userSelected = 0;

  constructor(private snackBar: MatSnackBar,
    public status: StatusService
  ) { 
    this.period = 1; 
  }

  ngOnInit(): void {
    // Aqui normalmente seriam chamadas de API para buscar dados reais
  }

  generateReport(): void {
    // Integração com o componente de relatórios existente
    console.log('Gerando relatório para', this.selectedMonth, 'e departamento', this.selectedDepartment);
    // Aqui seria chamado o serviço/componente de relatório
  }

  checkSelection(e) {

    // if (this.oldQueueId.includes(0) && this.queueId.length > 1) {
    //   // Selecionou algum outro que não foi o todos
    //   this.queueId.splice(this.queueId.indexOf(0), 1);
    //   this.queueId = JSON.parse(JSON.stringify(this.queueId));
    // } else if (!this.oldQueueId.includes(0) && this.queueId.includes(0)) {
    //   // Selecionou o todos, desmarca os demais
    //   this.queueId = [0];
    // }

    // this.oldQueueId = JSON.parse(JSON.stringify(this.queueId));

  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'absence': return 'medical';
      case 'overtime': return 'time-alert';
      case 'late': return 'clock';
      default: return 'bell';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'absence': return 'notification-absence';
      case 'overtime': return 'notification-overtime';
      case 'late': return 'notification-late';
      default: return '';
    }
  }

  dismissAlert(index: number): void {
    this.alerts.splice(index, 1);
    this.snackBar.open('Alerta descartado', 'Fechar', {
      duration: 3000
    });
  }

  viewEmployeeDetails(employee: Employee): void {
    console.log('Visualizando detalhes do colaborador:', employee);
    // Aqui abriria um dialog ou navegaria para uma página de detalhes
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'normal': return 'green';
      case 'warning': return 'orange';
      case 'critical': return 'red';
      default: return 'grey';
    }
  }

  // Filtra dados com base no departamento selecionado
  applyFilter(): void {
   
  }


  loadData(): void {}
}