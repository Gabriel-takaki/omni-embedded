
import {Component, ElementRef, Inject, Input, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import * as momentjs from 'moment'
import * as papa from 'papaparse';
import {animate, state, style, transition, trigger} from "@angular/animations";
import { StatusService } from 'app/services/status.service';


@Component({
  selector: 'ca-opportunitiescsvimport',
  templateUrl: './opportunitiescsvimport.component.html',
  styleUrls: ['./opportunitiescsvimport.component.scss'],
  animations: [
    trigger('visibilityChanged', [
      state('shown', style({
        "height": "auto"
      })),
      transition('void => shown',
        [style({height: '0px'}), animate('0.25s')]
      ),
      transition('shown => void',
        [style({height: 'auto'}), animate('0.25s', style({height: '0px'}))]
      )
    ])
  ]
})
export class OpportunitiescsvimportComponent {


  @ViewChild('csvDialog') csvDialog: ElementRef<HTMLInputElement>;
  @ViewChild('opList') opList: ElementRef<HTMLDivElement>;


  @Input() pipelineId = 0;

  moment = momentjs;
  step = 0;
  file;
  opportunities = [];

  keyColumn = 0;
  dupAction = 0;
  parseError = false;

  importing = false;
  imported = false;
  pauseImport = false;
  regId = 0;

  showHidden = false;

  scrollMax = 100;
  resetScrollMaxTimer;

  baseUrl = BASE_URL;

  ignoreCreateRestriction = false;

  createById = 0;

  fileErrorMessage = '';

  dynamicKeys: string[] = [];

  constructor(private notifications: NotificationsService,
    private dialog: MatDialogRef<OpportunitiescsvimportComponent>, private http: HttpClient, public status: StatusService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}



  scrollEvent() {
    if (this.opList.nativeElement.scrollTop > this.opList.nativeElement.scrollHeight - this.opList.nativeElement.offsetHeight - 200) {
      this.scrollMax = this.scrollMax + 15 >= this.opportunities.length ? this.opportunities.length : this.scrollMax + 15;
    }
    if (this.resetScrollMaxTimer) {
      clearTimeout(this.resetScrollMaxTimer);
    }
    if (this.opList.nativeElement.scrollTop < 150) {
      this.resetScrollMaxTimer = setTimeout(() => {
        this.resetScrollMaxTimer = null;
        this.scrollMax = 100;
      }, 1000);
    }
  }

    close() {
      this.dialog.close(this.imported);
    }
  
    openFileSelection() {
      this.csvDialog.nativeElement.click();
    }



    fileSelected(event: Event): void {
      const fileInput = event.target as HTMLInputElement;
      const file = fileInput?.files?.[0];
      this.fileErrorMessage = '';
      this.opportunities = []; // Reset opportunities
    
      if (!file) {
        return;
      }
    
      papa.parse(file, {
        worker: true,
        header: true,
        encoding: "utf8",
        complete: (result) => this.handleParseResult(result),
        error: () => {
          this.fileErrorMessage = 'Erro ao processar o arquivo.';
        }
      });
    }
    
    private handleParseResult(result: any): void {
      const MAX_RECORDS = 1000;
    
      if (!result.data || result.data.length === 0) {
        this.fileErrorMessage = 'Nenhum registro encontrado.';
        return;
      }
    
      if (result.data.length > MAX_RECORDS) {
        this.fileErrorMessage = `O arquivo deve ter no máximo ${MAX_RECORDS} registros.`;
        return;
      }
    
      const opportunities = result.data
        .filter((record: any) => this.isValidRecord(record))
        .map((record: any) => this.mapToOpportunity(record));
    
      if (opportunities.length === 0) {
        this.fileErrorMessage = 'Nenhum registro encontrado.';
        return;
      }
    
      this.opportunities = opportunities;
    }
    
    private isValidRecord(record: any): boolean {
      return !!(
        record['Título']?.length ||
        record.Etapa?.length ||
        record.Responsável?.length
      );
    }
    
    private mapToOpportunity(record: any): any {
      const data: any = {
        id: record.ID || record.id || null,
        stagename: record.Etapa || record.stage || null,
        fk_stage: record['Etapa ID'] || record.stage || null,
        title: (record['Título'] || record.title)?.slice(0, 255) || '',
        responsable: record['Responsável'] || record.responsable || null,
        responsableid: record['Responsável ID'] || record.responsableid || null,
        followersname: record.Seguidores || record.followersid || '',
        followers: record['Seguidores ID'] || record.followers || '',
        originname: record['Origem'] || record.origin || null,
        origin: record['Origem ID'] || record.origin || null,
        statusname: record.Estado || record.estado || null,
        status: record['Estado ID'] || record.estado || null,
        companyname: record.Empresa || record.company || '',
        company: record['Empresa ID'] || record.company || '',
        expectedclosedate: record['Prazo'] || record.expectedclosedate || '',
        formattedlocation: (record['Endereço'] || record.formattedlocation)?.slice(0, 255) || '',
        mainphone: (record['Telefone'] || record.mainphone)?.slice(0, 30) || '',
        mainmail: (record['E-mail'] || record.mainmail)?.slice(0, 155) || '',
        value: record.Valor || record.value || 0,
        recurrentvalue: record['Valor Recorrente'] || record.recurrentvalue || 0,
        probability: record.Probabilidade || record.probability || 0,
        tags: record.Etiquetas || record.tags || '',
        tagsid: record['Etiquetas ID'] || record.tags || '',
        createadAt: record['Criado em'] || record.createadAt || '',
        stagnated: record['Estagnada'] || record.stagnated || '',
        description: (record.Descrição || record.description)?.slice(0, 255) || '',
        loading: false,
        show: true,
        result: 0,
      };
    
      // processar formularios personalizados
      Object.keys(record).forEach((key) => {
        if (key.includes('#')) {
          data[key] = record[key];
          if (!this.dynamicKeys.includes(key)) {
            this.dynamicKeys.push(key);
          }
        }
      });
    
      return data;
    }


  async save() {

    this.importing = true;
    this.imported = true;
    this.pauseImport = false;

    for (let x = this.regId; x < this.opportunities.length; x++) {

      if (this.pauseImport) {
        break;
      }

      this.regId++;

      const op = this.opportunities[x];

      let error = false;

      const pipe = this.status?.allPipelinesMap?.[this.data.pipelineId]

      if(this.createById == 0){
        
        if (op.stagename) {
          
          const stage = Object.values(this.status.allPipestagesMap).filter((stage: any) =>
          stage?.name && this.normalizeStringFunction(stage?.name).includes(this.normalizeStringFunction(op.stagename)) && stage.fk_pipeline === pipe.id
        );
        op.fk_stage = null;
      if(stage.length > 0){
        op.fk_stage = stage[0].id 
      }
    }
  
      if(op.responsable){

      const responsable = Object.values(this.status.allUsersMap).filter((user: any) =>
        user?.userName && this.normalizeStringFunction(user?.userName).includes(this.normalizeStringFunction(op.responsable))
      );

      op.responsableid = null;
    if(responsable.length > 0){
        op.responsableid = responsable[0].id 
      }
      }

    
    if(op.origin){
      
      const origin: any = Object.values(this.status.allOriginsMap).filter((origin: any) =>
        origin?.name && this.normalizeStringFunction(origin?.name).includes(this.normalizeStringFunction(op.originname))
    );
      op.origin = null
    if(origin.length > 0){
      op.origin = origin[0].id 
      }
    }

    if(op.statusname){

      switch (op.statusname) {
        case 'Aberta':
          op.status = 1;
          break;
        case 'Ganha':
          op.status = 2;
          break;
        case 'Perdida':
          op.status = 3;
          break;
        case 'Congelada':
          op.status = 4;
          break;
        default:
          op.status = null;
          break;
           }
      }

    
  
    }

      if (error) {
        continue;
      }


      if(op.followers){
        // pega cada valor separado por vírgula e remove os espaços e adiciona em um array
        op.followers = op.followers.trim()                 // Remove espaços no começo e no final
        .replace(/,\s*$/, "")   // Remove a vírgula extra no final
        .split(",")             // Divide a string por vírgulas
        .map(Number);           // Converte cada item em número
        
      }

      if(op.tagsid){
        op.tags = op.tagsid.trim()                 // Remove espaços no começo e no final
        .replace(/,\s*$/, "")   // Remove a vírgula extra no final
        .split(",")             // Divide a string por vírgulas
        .map(Number);   
      }

      if(op.stagnated){
        op.stagnated = op.stagnated === 'Sim' ? 1 : 0;
      }

      if(this.dynamicKeys.length > 0){ 
        op.formsdata = {};
        this.dynamicKeys.forEach(key => {
          // op.formsdata[key] = op[key];
          // seta como chave só o que tiver de hashtag pra frente
          op.formsdata[key.split('#')[1]] = op[key];
        });
      }

      const opportunityObj = {
        id: op.id,
        clientid: op.clientid || '',
        fkPipeline : this.data.pipelineId,
        fkStage : op.fk_stage,
        title : op.title,
        description: op.description,
        responsableid: op.responsableid,
        createdBy: 1,
        mainphone: op.mainphone,
        mainmail: op.mainmail,
        value: op.value,
        recurrentvalue: op.recurrentvalue,
        origin: op.origin,
        expectedclosedate: op.expectedclosedate,
        tags: op.tags,
        probability: op.probability,
        formattedlocation: op.formattedlocation,
        fkCompany: op.company,
        status: op.status,
        formsdata: op.formsdata,
        stagnated: op.stagnated,
        followers: op.followers,
        createdAt: op.createadAt,
        files: [],
        contactsCount: 0,
        filesCount: 0,
        stagebegintime: 0,
        country: '',
        city: '',
        countrycode: '',
        locationtype: '',
        state: '',
        address1: '',
        address2: '',
        postalcode: '',
        lat: 0,
        lon: 0,
        frozenuntil: null,
        visibility: null,
        createdby: null,
        closedat: null,
        closedby: null,
        contacts: [],
        parentopportunity: [],
        products: [],
        notes: [],
        history: [],
        interactions: [],
        tasks: [],
        chatId: null,
        queueId: null,
        processing: null,
        ignorerestriction: this.ignoreCreateRestriction,
        importing: true, 
      }

      await new Promise((resolve, reject) => {

        this.http.post(BASE_URL + '/opportunities/importOpportunities',{
          dupAction: this.dupAction,
          keyColumn: this.keyColumn,
          ...opportunityObj}, 
          {observe: "response"}).subscribe((r: any) => {
            console.log(r)
          if(r.body?.id){
            if(r.body?.updated){
              op.result = 2;
              this.hideTimer(op);
              return resolve(null);
            }
              op.result = 1;
              this.hideTimer(op);
              return resolve(null);
          }
          if(r.status == 400 || r.status == 403 || r.status == 404){

            op.result = 4;
            switch (r.status) {
              case 400:
                op.errorstring = 'Erro ao processar verifique os dados obrigatórios';
                break;
              case 403:
                op.errorstring = 'Sem permissão para criar oportunidade';
                break;
              case 404:
                op.errorstring = 'Funil não encontrado';
                break;
            }

            this.hideTimer(op);
            return resolve(null);

          }
          op.result = Number(r.body);
          this.hideTimer(op);
          return resolve(null);
      }, err => {
        console.log(err);
           op.result = 4;
           switch (err.status) {
            case 400:
              op.errorstring = 'Erro ao processar verifique os dados obrigatórios';
              break;
            case 403:
              op.errorstring = 'Sem permissão para criar oportunidade';
              break;
            case 404:
              op.errorstring = 'Funil não encontrado';
              break;
           }
            return resolve(null);
      });

      });

    }

    this.importing = false;

  }

  pause() {
    this.pauseImport = true;
  }

  hideTimer(op) {
    setTimeout(() => {
      op.show = false;
    }, 1000)
  }

  downloadErrorData() {
    const csv = papa.unparse(this.opportunities
      .filter((op) => op.result === 4)
      .map((op) => ({
        'Título': op.title,
        'Etapa': op.stagename,
        'Responsável': op.responsable,
        'Origem': op.originnaame,
        'Estado': op.statusname,
        'Empresa': op.companyname,
        'Prazo': op.expectedclosedate,
        'Endereço': op.formattedlocation,
        'Telefone': op.mainphone,
        'E-mail': op.mainmail,
        'Valor': op.value,
        'Valor Recorrente': op.recurrentvalue,
        'Probabilidade': op.probability,
        'Etiquetas': op.tags,
        'Criado em': op.createadAt,
        'Estagnada': op.stagnated,
        'Descrição': op.description,
        'Formulário personalizado': op.formsdata,
        'Erro': op.errorstring
      }))
    );
  
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;  // Aqui está o ajuste: definindo o href corretamente
    a.download = 'erros_importacao.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  

  hasError(): boolean {
    return this.opportunities.some(oportunidade => oportunidade.result === 4);
  }

  normalizeStringFunction(str){
    // tira acentos, espaços e deixa tudo em minúsculo
    if(!str) return ''
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g, '').toLowerCase()
  }



}