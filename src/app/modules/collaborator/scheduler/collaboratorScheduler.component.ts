import { Component, OnInit, Type } from '@angular/core';
import { extend } from '@syncfusion/ej2-base';
import {
    EventSettingsModel,
    View,
    ActionEventArgs,
    PopupOpenEventArgs,
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    AgendaService,
    MonthAgendaService,
    TimelineViewsService,
    TimelineMonthService,
    EventRenderedArgs,
} from '@syncfusion/ej2-angular-schedule';
import { CollaboratorService } from 'app/core/services/collaborator/collaborator.service';
import { SessionService } from 'app/core/auth/Session/session.service';
import { User } from 'app/core/entities/User';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { forkJoin } from 'rxjs';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { RemoteWorkRequestStatus } from 'app/core/entities/RemoteWorkRequestStatus';
import { Team } from 'app/core/entities/Team';

@Component({
    selector: 'example',
    templateUrl: './collaboratorScheduler.component.html',
    providers: [
        DayService,
        WeekService,
        WorkWeekService,
        MonthService,
        AgendaService,
        MonthAgendaService,
        TimelineViewsService,
        TimelineMonthService,
    ],
    styleUrls  : ['./collaboratorScheduler.component.scss']

})
export class collaboratorSchedulerComponent implements OnInit {
    public selectedDate: Date = new Date(2024, 6, 10);
    public eventSettings: EventSettingsModel = {
        dataSource: extend([], null, true) as Record<string, any>[],
    };
    public currentView: View = 'Month';
    public views: View[] = ['Week','Month', 'Agenda'];
    public blockedDays: BlockedDay[] = [];
    public user: User;
    public userTeam: Team;
    public remoteWorkRequests: RemoteWorkRequest[];
    public isDataLoaded: boolean = false; // Flag to check if data is loaded

    

    constructor(
        private collaboratorService: CollaboratorService,
        private sessionService: SessionService
    ) {}

    ngOnInit(): void {
        this.user = this.sessionService.getUser();
        this.onfetchData();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Scheduler settings  methods
    // -----------------------------------------------------------------------------------------------------

    onActionBegin(args: ActionEventArgs): void {
        if (args.requestType === 'eventRemove') {
            const event = args.data[0];
            const eventId = event.Id as string;
            if (eventId.startsWith('remote_')) {
                const remoteWorkRequestId = eventId.split('_')[1];
                this.onDeleteRemoteWorkRequest(remoteWorkRequestId);
            }
        }
    }

    onPopupOpen(args: PopupOpenEventArgs): void {
        if (args.type === 'Editor' || args.type === 'QuickInfo') {
            const event = args.data;
            const isBlockedDay = event.IsBlockedDay;
            const isRemoteWork = event.IsRemoteWork;
            const status = event.Status;

            if (isBlockedDay || (isRemoteWork && status !== RemoteWorkRequestStatus.PENDING)) {
                this.checkEventSettings(args);
            } else if (this.isRemoteWorkRequestExists(event.StartTime,this.user.idUser)) {
                args.cancel = true;
                alert('A remote work request already exists for this day.');
            }
            else if (this.isBlockedDayExists(event.startTime)) {
                args.cancel = true;
                alert('A Blocked Day exists for this day.');
            }
        }
    }

    isRemoteWorkRequestExists(date: Date, userId: number): boolean {
        return this.remoteWorkRequests.some(request =>
            new Date(request.requestDate).toDateString() === date.toDateString() &&
            Number(request.user.idUser)== userId
        );
    }

    isBlockedDayExists(date: Date): boolean {
        return this.blockedDays.some(request =>
            new Date(request.blockedDate).toDateString() === date.toDateString()
        );
    }


    transformBlockedDaysToEvents(
        blockedDays: BlockedDay[]
    ): Record<string, any>[] {
        return blockedDays.map((day) => ({
            Id: `blocked_${day.idBlockedDay}`,
            Subject: `Blocked Day [${day.reason}]`,
            StartTime: new Date(day.blockedDate),
            EndTime: new Date(day.blockedDate),
            IsAllDay: true,
            IsBlockedDay: true,
            Reason: day.reason,
            Team: this.user.userTeam.teamName,
            color:'#ef4444'
        
        }));
    }

    transformRemoteWorkRequestsToEvents(
        remoteWorkRequests: RemoteWorkRequest[]
    ): Record<string, any>[] {
        return remoteWorkRequests.map((request) => ({
            Id: `remote_${request.idRemoteWorkRequest}`,
            Subject: `Remote Work [${request.comment}]`,
            StartTime: new Date(request.requestDate),
            EndTime: new Date(request.requestDate),
            IsAllDay: true,
            IsRemoteWork: true,
            Comment: request.comment,
            Status: request.requestStatus,
            User: this.user,
        }));
    }

    updateEventSettings() {
        const blockedDaysEvents = this.transformBlockedDaysToEvents(
            this.blockedDays
        );
        const remoteWorkEvents = this.transformRemoteWorkRequestsToEvents(
            this.remoteWorkRequests
        );

        this.eventSettings = {
            dataSource: [...blockedDaysEvents, ...remoteWorkEvents],
            fields: {
                id: 'Id',
                subject: { name: 'Subject' },
                isAllDay: { name: 'IsAllDay' },
                startTime: { name: 'StartTime' },
                endTime: { name: 'EndTime' },
            },
        };

        this.isDataLoaded = true; // Set the flag to true once data is loaded

    }

    checkEventSettings(args: Record<string, any>) {
        const eventData = args.data;
        console.log('Event Data:', eventData);

        const quickPopup: HTMLElement = args.element.querySelector(
            '.e-quick-popup-wrapper .e-event-popup'
        );
        const editButton: HTMLElement = quickPopup.querySelector(
            '.e-header-icon-wrapper .e-edit'
        );
        const deleteButton: HTMLElement = quickPopup.querySelector(
            '.e-header-icon-wrapper .e-delete'
        );

        if (editButton) editButton.remove();
        if (deleteButton) deleteButton.remove();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data handle methods
    // -----------------------------------------------------------------------------------------------------

    onfetchData(): void {
        const teamId = this.user.userTeam.idTeam;
        const userId = this.user.idUser;

        forkJoin({
            blockedDays:
                this.collaboratorService.getAllBlockedDaysByTeam(teamId),
            remoteWorkRequests:
                this.collaboratorService.getRemoteWorkRequestByUser(userId),
        }).subscribe({
            next: ({ blockedDays, remoteWorkRequests }) => {
                this.blockedDays = blockedDays;
                this.remoteWorkRequests = remoteWorkRequests;
                this.updateEventSettings();
            },
            error: (error: any) => {
                console.error('Error fetching data:', error);
            },
            complete: () => {
                console.log('Data fetch complete');
            },
        });
    }

    onDeleteRemoteWorkRequest(remoteWorkRequestId: any) {
        this.collaboratorService
            .cancelRemoteWorkRequest(remoteWorkRequestId)
            .subscribe({
                next: (RemoteWorkRequest: RemoteWorkRequest) => {
                    console.log(
                        'Remote work request deleted:',
                        RemoteWorkRequest
                    );
                },
                error: (error: any) => {
                    console.error('Error deleting remote work request:', error);
                },
                complete: () => {
                    console.log('Delete complete');
                },
            });
    }


    
    onEventRendered(args: EventRenderedArgs): void {
            const DateCell = args.data.StartTime.toDateString();

            // Check if the cell date is a blocked day
            if (this.blockedDays.some(day => new Date(day.blockedDate).toDateString() === DateCell)) {
                args.element.style.backgroundColor='#06b6d4'
            }

            const request = this.remoteWorkRequests.find(request =>
                new Date(request.requestDate).toDateString() === DateCell &&
                Number(request.user.idUser) === this.user.idUser
            );

            if (request) {
                switch (request.requestStatus) {
                    case RemoteWorkRequestStatus.REFUSED:
                        args.element.style.backgroundColor='#ef4444'
                        break;
                    case RemoteWorkRequestStatus.APPROVED:
                        args.element.style.backgroundColor='#10b981'
                        break;
                    case RemoteWorkRequestStatus.PENDING:
                        args.element.style.backgroundColor='##f59e0b'
                        break;
                }
            }

        }
      

}
