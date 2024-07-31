import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { extend } from '@syncfusion/ej2-base';
import {
    EventSettingsModel,
    View,
    EventRenderedArgs,
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    AgendaService,
    ResizeService,
    DragAndDropService,
    ScheduleModule,
    MonthAgendaService,
    TimelineViewsService,
    TimelineMonthService,
    ActionEventArgs,
    PopupOpenEventArgs,
} from '@syncfusion/ej2-angular-schedule';
import { CollaboratorService } from 'app/core/services/collaborator/collaborator.service';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { SessionService } from 'app/core/auth/Session/session.service';
import { User } from 'app/core/entities/User';
import { Role } from 'app/core/entities/Role';
import { Team } from 'app/core/entities/Team';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';

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
})
export class collaboratorSchedulerComponent implements OnInit {
    // -----------------------------------------------------------------------------------------------------
    // @ Schedule inital Settings params  methods
    // -----------------------------------------------------------------------------------------------------
    public selectedDate: Date = new Date(2024, 6, 10);
    public eventSettings: EventSettingsModel = {
        dataSource: extend([], null, true) as Record<string, any>[],
    };
    public currentView: View = 'Month';
    public views: View[] = ['Month', 'Agenda'];
    public blockedDays: BlockedDay[] = [];
    public user: User;
    public userTeam: Team;
    public remoteWorkRequests: RemoteWorkRequest[];

    /**
     * Constructor
     */
    constructor(
        private collaboratorService: CollaboratorService,
        private sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.user = this.sessionService.getUser();
        this.onGetAllBlockedDaysByTeam(this.user.userTeam.idTeam);
        this.onGetRemoteWorkRequestByUser(this.user.idUser);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Scheduler handle methods
    // -----------------------------------------------------------------------------------------------------

    onActionBegin(args: ActionEventArgs): void {
        if (args.requestType === 'eventRemove') {
            const event = args.data[0]; // Get the event being removed
            const eventId = event.Id as string;
            if (eventId.startsWith('remote_')) {
                const remoteWorkRequestId = eventId.split('_')[1];
                // Perform deletion logic for remote work request
                this.onDeleteRemoteWorkRequest(remoteWorkRequestId);
            }
        }
    }

    onPopupOpen(args: PopupOpenEventArgs): void {
        if (args.type === 'Editor' || args.type === 'QuickInfo') {
            const event = args.data;
            const isBlockedDay = event.IsBlockedDay;
            if (isBlockedDay) {
                args.cancel = true; // Cancel popup for blocked days
                alert(
                    'Editing or creating events on blocked days is disabled.'
                );
            }
        }
    }

    transformBlockedDaysToEvents(
        blockedDays: BlockedDay[]
    ): Record<string, any>[] {
        return blockedDays.map((day) => ({
            Id: `blocked_${day.idBlockedDay}`, // Unique ID for the event
            Subject: 'Blocked Day [' + day.reason + ']', // Display text for the event
            StartTime: new Date(day.blockedDate), // Start date and time
            EndTime: new Date(
                new Date(day.blockedDate).setDate(
                    new Date(day.blockedDate).getDate()
                )
            ), // End date and time (24 hours later)
            IsAllDay: true, // Display as an all-day event
            IsBlockedDay: true, // Custom property to denote blocked day
        }));
    }

    transformRemoteWorkRequestsToEvents(
        remoteWorkRequests: RemoteWorkRequest[]
    ): Record<string, any>[] {
        return remoteWorkRequests.map((request) => ({
            Id: `remote_${request.idRemoteWorkRequest}`,
            Subject: 'Remote Work [' + request.comment + ']',
            StartTime: new Date(request.requestDate),
            EndTime: new Date(
                new Date(request.requestDate).setDate(
                    new Date(request.requestDate).getDate()
                )
            ),
            IsAllDay: true,
            IsRemoteWork: true,
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
        };
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Data handle methods
    // -----------------------------------------------------------------------------------------------------

    onGetAllBlockedDaysByTeam(idTeam: number): void {
        this.collaboratorService.getAllBlockedDaysByTeam(idTeam).subscribe({
            next: (BlockedDay: BlockedDay[]) => {
                this.blockedDays = BlockedDay;

                console.log(
                    'blocked Days fetched successfully:',
                    this.blockedDays
                );
                this.eventSettings = {
                    dataSource: this.transformBlockedDaysToEvents(
                        this.blockedDays
                    ),
                };
            },
            error: (error: any) => {
                // Handle error, e.g., log it or show a user-friendly message
                console.error('Error fetching blocked days :', error);
            },
            complete: () => {
                console.log('Fetch complete');
            },
        });
    }

    onGetRemoteWorkRequestByUser(idUser: number) {
        this.collaboratorService.getRemoteWorkRequestByUser(idUser).subscribe({
            next: (RemoteWorkRequest: RemoteWorkRequest[]) => {
                this.remoteWorkRequests = RemoteWorkRequest;
                this.updateEventSettings();
                console.log(RemoteWorkRequest);
            },
            error: (error: any) => {
                // Handle error, e.g., log it or show a user-friendly message
                console.error('Error fetching blocked days :', error);
            },
            complete: () => {
                console.log('Fetch complete');
            },
        });
    }

    onDeleteRemoteWorkRequest(RemoteWorkRequest: any) {
        this.collaboratorService.cancelRemoteWorkRequest(RemoteWorkRequest).subscribe({
            next: (RemoteWorkRequest: RemoteWorkRequest) => {

            },
            error: (error: any) => {
                // Handle error, e.g., log it or show a user-friendly message
                console.error('Error fetching blocked days :', error);
            },
            complete: () => {
                console.log('Fetch complete');
            },
        });
    }




}
