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

    // Controls the trigger on action edit delete or add
    onActionBegin(args: ActionEventArgs): void {
        const eventData = args.data;

        if (args.requestType === 'eventRemove') {
        }
        // Handle save event
        if (args.requestType === 'eventSave') {

        }
        if (args.requestType === 'eventCreate') {
            this.handleSaveEvent(eventData);
        }
    }

    onPopupOpen(args: PopupOpenEventArgs): void {
        const event = args.data;
        const requestDate = event.StartTime;
        const IsRemoteWork = event.IsRemoteWork;
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
            if (requestDate < new Date()) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'You cannot add a blocked day for a date in the past.'
                );
                return;
            }
        } else this.checkEventSettings(args, IsRemoteWork);
    }

    // Prevents the edit for the approved, refused and blocked days
    checkEventSettings(args: Record<string, any>, IsRemoteWork: boolean) {
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
                new Date(request.requestDate).setHours(0, 0, 0, 0) === dateCell
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

    //handels the save process
    handleSaveEvent(eventData: Record<string, any>): void {
        // Assuming eventData is an array of events
        const event = eventData[0];

        const blockedDay: BlockedDay = {
            blockedDate: this._fuseUtilsService.formatDateForServer(
                event.StartTime
            ),
            reason: event.Title || '', // Title for the blocked Day
        };

        this.addBlockedDayToATeam(blockedDay);
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

                this.eventSettings = this._fuseUtilsService.updateEventSettings(
                    blockedDays,
                    remoteWorkRequests,
                    this.user,
                    this.eventSettings
                );
            },
            error: (error: any) => {
                console.error('Error fetching data:', error);
            },
            complete: () => {
                console.log('Data fetch complete');
            },
        });
    }

    addBlockedDayToATeam(blockedDay: BlockedDay) {
        this.managerService
            .addBlockedDay(this.user.managedTeam.idTeam, blockedDay)
            .subscribe({
                next: (response: BlockedDay) => {
                    console.log(
                        'The Blocked has been added sucessfully',
                        response
                    );
                },
                error: (err: any) => {
                    console.log('The Blocked has been added sucessfully', err);
                },
            });
    }
}
