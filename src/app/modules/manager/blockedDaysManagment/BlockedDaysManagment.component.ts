import { Component } from '@angular/core';
import {
    ActionEventArgs,
    AgendaService,
    DayService,
    EventRenderedArgs,
    EventSettingsModel,
    MonthAgendaService,
    MonthService,
    PopupOpenEventArgs,
    TimelineMonthService,
    TimelineViewsService,
    View,
    WeekService,
    WorkWeekService,
} from '@syncfusion/ej2-angular-schedule';
import { User } from 'app/core/entities/User';
import { extend } from '@syncfusion/ej2-base';
import { SessionService } from 'app/core/auth/Session/session.service';
import { ManagerService } from 'app/core/services/manager/Manager.service';
import { forkJoin } from 'rxjs';
import { CollaboratorService } from 'app/core/services/collaborator/collaborator.service';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { FuseUtilsService } from '@fuse/services/utils';
import { RemoteWorkRequestStatus } from 'app/core/entities/RemoteWorkRequestStatus';

@Component({
    selector: 'example',
    templateUrl: './blockedDaysManagment.component.html',
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
export class BlockedDaysManagment {
    public user: User;
    public selectedDate: Date = new Date();
    public eventSettings: EventSettingsModel = {
        dataSource: extend([], null, true) as Record<string, any>[],
    };
    public currentView: View = 'Month';
    public views: View[] = ['Week', 'Month', 'Agenda'];
    public blockedDays: BlockedDay[] = [];
    public remoteWorkRequests: RemoteWorkRequest[];

    /**
     * Constructor
     */
    constructor(
        private _sessionService: SessionService,
        private managerService: ManagerService,
        private collaboratorService: CollaboratorService,
        private _fuseUtilsService: FuseUtilsService
    ) {
        this.user = this._sessionService.getUser();
        this.onFetchData();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Scheduler settings methods
    // -----------------------------------------------------------------------------------------------------
    onPopupOpen(args: PopupOpenEventArgs): void {
        const event = args.data;
        const requestDate = event.StartTime;
        const status = event.Status;
        const IsRemoteWork = event.IsRemoteWork


              
         // If the target is the scheduler cell (date), apply the logic in the else block
        if (
            (args.type === 'Editor' || args.type === 'QuickInfo') &&
            !args.target.classList.contains('e-appointment')
        ) {
            // Logic for clicking on a date in the scheduler
        if (this.isBlockedDayExists(requestDate)) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'A remote work request already exists for this day.'
                );
                return;
            } 

        }
        else[
            this.checkEventSettings(args,IsRemoteWork)         
        ]
                    
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data treatment  methods
    // -----------------------------------------------------------------------------------------------------

    // Calls the get data method for the blocked days and remote request days in order to merge them dynamically
    onFetchData(): void {
        forkJoin({
            blockedDays: this.collaboratorService.getAllBlockedDaysByTeam(
                this.user.managedTeam.idTeam
            ),
            remoteWorkRequests:
                this.managerService.getAllRemoteWorkRequestByTeam(
                    this.user.idUser,
                    ['REFUSED', 'APPROVED']
                ),
        }).subscribe({
            next: ({ blockedDays, remoteWorkRequests }) => {
                this.blockedDays = blockedDays;
                this.remoteWorkRequests = remoteWorkRequests;
                console.log(this.blockedDays);
                console.log(this.remoteWorkRequests);
                this.eventSettings = this._fuseUtilsService.updateEventSettings(
                    blockedDays,
                    remoteWorkRequests,
                    this.user,
                    this.eventSettings
                );
                console.log(this.eventSettings);
            },
            error: (error: any) => {
                console.error('Error fetching data:', error);
            },
            complete: () => {
                console.log('Data fetch complete');
            },
        });
    }

    // Prevents the edit for the approved, refused and blocked days
    checkEventSettings(args: Record<string, any>,IsRemoteWork : boolean) {
        const eventData = args.data;

        const quickPopup: HTMLElement = args.element.querySelector(
            '.e-quick-popup-wrapper .e-event-popup'
        );
        const editButton: HTMLElement = quickPopup.querySelector(
            '.e-header-icon-wrapper .e-edit'
        );

        console.log('Event Data:', eventData);
        if (IsRemoteWork) {
            const deleteButton: HTMLElement = quickPopup.querySelector(
                '.e-header-icon-wrapper .e-delete'
            );
            editButton.remove();
            deleteButton.remove();
        } else {
            editButton.remove();
        }
    }

    // Verify if the current date has an already remote request for the same user
    isBlockedDayExists(date: Date): boolean {
        console.log(this.blockedDays)
        console.log(date)

        return this.blockedDays.some(
            (request) =>
                new Date(request.blockedDate).toDateString() ===
                    date.toDateString()
        );
    }


    // Render the cells in order to change the colors depending on the type of event
    onEventRendered(args: EventRenderedArgs): void {
        const dateCell = new Date(args.data.StartTime).setHours(0, 0, 0, 0);

        // Check if the cell date is a blocked day
        if (
            this.blockedDays.some(
                (day) =>
                    new Date(day.blockedDate).setHours(0, 0, 0, 0) === dateCell
            )
        ) {
            args.element.style.backgroundColor = '#06b6d4';
        }

        const request = this.remoteWorkRequests.find(
            (request) =>
                new Date(request.requestDate).setHours(0, 0, 0, 0) ===
                    dateCell && Number(request.user.idUser) === this.user.idUser
        );

        if (request) {
            switch (request.requestStatus) {
                case RemoteWorkRequestStatus.REFUSED:
                    args.element.style.backgroundColor = '#ef4444';
                    break;
                case RemoteWorkRequestStatus.APPROVED:
                    args.element.style.backgroundColor = '#10b981';
                    break;
            }
        }
    }
}
