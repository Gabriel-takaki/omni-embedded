import {Injectable} from "@angular/core";
import {StatusService} from "./status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {NotificationsService} from "angular2-notifications";
import {MatDialog} from "@angular/material/dialog";
import {ConcludeTaskComponent} from "../reusable/conclude-task.component";
import {EventsService} from "./events.service";
import {TaskDetailDialogComponent} from "../tasksModule/task-detail-dialog.component";

@Injectable({providedIn: 'root'})
export class TasksService {

    constructor(private status: StatusService, private http: HttpClient, private notifications: NotificationsService,
                private events: EventsService, public dialog: MatDialog) {

    }

    markAsDone(task) {
        if (!task) {
            return;
        }
        const diagSub = this.dialog.open(ConcludeTaskComponent, {autoFocus: false}).afterClosed().subscribe((r: any) => {
            if (r?.conclude) {
                if (task.status < 2) {
                    this.http.post(BASE_URL + '/tasks/markAsDone', {id: task.id}, {observe: "response"}).subscribe(r2 => {
                        this.events.emit('reloadTasks');
                    }, err => {
                        this.notifications.error($localize`Erro`, $localize`Erro ao marcar tarefa como concluída.`);
                    });
                    if (r.reopen) {
                        const sub = this.dialog.open(TaskDetailDialogComponent, {
                            data: {cloning: true, task}
                        }).afterClosed().subscribe(r2 => {
                            sub.unsubscribe();
                            if (r) {
                                this.events.emit('reloadTasks');
                            }
                        });
                    }
                }
            }
        });
    }

}
