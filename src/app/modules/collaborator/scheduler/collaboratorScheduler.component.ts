import { Component, OnInit } from '@angular/core';
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
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { RemoteWorkRequestStatus } from 'app/core/entities/RemoteWorkRequestStatus';
import { Team } from 'app/core/entities/Team';
import { FuseUtilsService } from '@fuse/services/utils';
import { forkJoin } from 'rxjs';
import { UpdateRemoteWorkRequest } from 'app/core/entities/requests/updateRemoteWorkRequest';

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
    public selectedDate: Date = new Date(2024, 6, 10);
    public eventSettings: EventSettingsModel = {
        dataSource: extend([], null, true) as Record<string, any>[],
    };
    public currentView: View = 'Month';
    public views: View[] = ['Week', 'Month', 'Agenda'];
    public blockedDays: BlockedDay[] = [];
    public user: User;
    public userTeam: Team;
    public remoteWorkRequests: RemoteWorkRequest[];
    public maxApprovedRequestsPerDay: number;
    public maxApprovedRequestsPerMonth: number;
    private isSavingNewRequest: boolean = false; // Flag to check first save
    private currentEditingEventId: string; // To store the ID of the event being edited

    constructor(
        private collaboratorService: CollaboratorService,
        private sessionService: SessionService,
        private _fuseUtilsService: FuseUtilsService,
    ) {}

    ngOnInit(): void {
        this.user = this.sessionService.getUser();
        this.maxApprovedRequestsPerDay = this.user.userTeam.onsiteEmployees;
        this.maxApprovedRequestsPerMonth = this.user.remoteWorkBalance;

        this.onfetchData();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Scheduler settings methods
    // -----------------------------------------------------------------------------------------------------

    // Controls the trigger on action edit delete or add
    onActionBegin(args: ActionEventArgs): void {
        if (args.requestType === 'eventRemove') {
            const event = args.data[0];
            const eventId = event.Id as string;
            if (eventId.startsWith('remote_')) {
                const remoteWorkRequestId = eventId.split('_')[1];
                this.onDeleteRemoteWorkRequest(remoteWorkRequestId);
            }
        }
        // Handle save event
        if (args.requestType === 'eventSave') {
            const eventData = args.data;

                this.handleUpdateEvent(eventData);
            
        }
        if (args.requestType === 'eventCreate') {
            this.isSavingNewRequest = true; // Set the flag to true for the first save
            const eventData = args.data;
            this.handleSaveEvent(eventData);
        }
    }

    // Controls the event of the pop up of the add and detail
    onPopupOpen(args: PopupOpenEventArgs): void {
        if (args.type === 'Editor' || args.type === 'QuickInfo') {
            const event = args.data;
            const isBlockedDay = event.IsBlockedDay;
            const isRemoteWork = event.IsRemoteWork;
            const status = event.Status;
            const requestDate = event.StartTime;

            this.presetTitleAndDescription(args);

            if (
                isBlockedDay ||
                (isRemoteWork )
            ) {
                this.checkEventSettings(args, status);
            } else if (
                this.isRemoteWorkRequestExists(requestDate, this.user.idUser)
            ) {
                args.cancel = true;
                alert('A remote work request already exists for this day.');
            } else if (this.isBlockedDayExists(requestDate)) {
                args.cancel = true;
                alert('A Blocked Day exists for this day.');
            } else if (isRemoteWork) {
                if (!this.canAddRemoteWorkRequest(requestDate)) {
                    args.cancel = true;
                    alert(
                        `You cannot add more than ${this.maxApprovedRequestsPerDay} approved remote work requests per day.`
                    );
                } else if (!this.canAddRemoteWorkRequestForMonth(requestDate)) {
                    args.cancel = true;
                    alert(
                        `You cannot add more than ${this.maxApprovedRequestsPerMonth} approved remote work requests per month.`
                    );
                }
            }

            // Store the event ID for editing purposes
            if (args.type === 'Editor' && event.IsRemoteWork) {
                this.currentEditingEventId = event.Id as string;
            }
        }
    }

    //handles the update for a remote work 
    handleUpdateEvent(eventData: Record<string, any>): void {
        // Extract ID and status from eventData
        const remoteWorkRequestId = Number(eventData.Id.split('_')[1]);
        const remoteWorkRequestStatus = eventData.Status;

        const updateRequest: UpdateRemoteWorkRequest = {
            remoteWorkRequestID: remoteWorkRequestId,
            remoteWorkRequestStatus: remoteWorkRequestStatus
        };

        console.log(updateRequest)
        //this.updateRemoteWorkRequest(updateRequest);
    }

    handleSaveEvent(eventData: Record<string, any>): void {
        // Create a RemoteWorkRequest object from eventData
        const remoteWorkRequest: RemoteWorkRequest = {
            user: this.user,
            requestDate: this._fuseUtilsService.formatDateForServer(eventData[0].StartTime),
            comment: eventData.Description || '', // Assuming Description is the comment
            requestStatus: RemoteWorkRequestStatus.PENDING, // Set the default status
        };
        console.log(remoteWorkRequest)

        this.addRequest(remoteWorkRequest);
    }

    // Verify if the current date has an already remote request for the same user
    isRemoteWorkRequestExists(date: Date, userId: number): boolean {
        return this.remoteWorkRequests.some(
            (request) =>
                new Date(request.requestDate).toDateString() ===
                    date.toDateString() && Number(request.user.idUser) == userId
        );
    }

    // Blocks the title and the description for the add
    presetTitleAndDescription(args: PopupOpenEventArgs) {
        const titleElement = args.element.querySelector(
            '.e-subject'
        ) as HTMLInputElement;
        titleElement.value = `${this.user.fullName} [Remote Work]`;
        titleElement.setAttribute('readonly', 'true');

        if (args.type === 'Editor') {
            const descriptionElement = args.element.querySelector(
                '.e-description'
            ) as HTMLTextAreaElement;
            descriptionElement.removeAttribute('readonly');
        }
        if (args.type === 'Editor') {
            // Lock the end time
            const endTimeElement = args.element.querySelector(
                '.e-end'
            ) as HTMLInputElement;
            const startTimeElement = args.element.querySelector(
                '.e-start'
            ) as HTMLInputElement;
            endTimeElement.setAttribute('disabled', 'true');

            // Update the end time whenever the start time changes
            startTimeElement.addEventListener('change', () => {
                endTimeElement.value = startTimeElement.value;
            });

            const descriptionElement = args.element.querySelector(
                '.e-description'
            ) as HTMLTextAreaElement;
            descriptionElement.removeAttribute('readonly');
        }

        // Remove unnecessary fields
        const locationElement = args.element.querySelector(
            '.e-location-container'
        ) as HTMLElement;
        const allDayElement = args.element.querySelector(
            '.e-all-day-container'
        ) as HTMLElement;
        const repeatContainerElement = args.element.querySelector(
            '.e-recurrence-container'
        ) as HTMLElement;
        const repeatDropdownElement = args.element.querySelector(
            'e-repeat-container'
        ) as HTMLElement;

        if (locationElement) locationElement.style.display = 'none';
        if (allDayElement) allDayElement.style.display = 'none';
    }

    // Transform the blocked Days to events
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
        }));
    }

    // Transform the remote work requests to events
    transformRemoteWorkRequestsToEvents(
        remoteWorkRequests: RemoteWorkRequest[]
    ): Record<string, any>[] {
        return remoteWorkRequests.map((request) => ({
            Id: `remote_${request.idRemoteWorkRequest}`,
            Subject: `${request.user.fullName} [Remote Work]`,
            StartTime: new Date(request.requestDate),
            EndTime: new Date(request.requestDate),
            IsAllDay: true,
            IsRemoteWork: true,
            Comment: request.comment,
            Status: request.requestStatus,
            User: this.user,
        }));
    }

    // Merge the blocked days and remote requests into event settings
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
                subject: { name: 'Subject', validation: { required: true } },
                isAllDay: { name: 'IsAllDay' },
                startTime: { name: 'StartTime' },
                endTime: { name: 'EndTime' },
            },
        };
    }

    // Prevents the edit for the approved, refused and blocked days
    checkEventSettings(args: Record<string, any>, status: any) {
        const eventData = args.data;
        console.log('Event Data:', eventData);
        if (status != RemoteWorkRequestStatus.PENDING) {
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
    }

    // Render the cells in order to change the colors depending on the type of event
    onEventRendered(args: EventRenderedArgs): void {
        const DateCell = args.data.StartTime.toDateString();

        // Check if the cell date is a blocked day
        if (
            this.blockedDays.some(
                (day) => new Date(day.blockedDate).toDateString() === DateCell
            )
        ) {
            args.element.style.backgroundColor = '#06b6d4';
        }

        const request = this.remoteWorkRequests.find(
            (request) =>
                new Date(request.requestDate).toDateString() === DateCell &&
                Number(request.user.idUser) === this.user.idUser
        );

        if (request) {
            switch (request.requestStatus) {
                case RemoteWorkRequestStatus.REFUSED:
                    args.element.style.backgroundColor = '#ef4444';
                    break;
                case RemoteWorkRequestStatus.APPROVED:
                    args.element.style.backgroundColor = '#10b981';
                    break;
                case RemoteWorkRequestStatus.PENDING:
                    args.element.style.backgroundColor = '#f59e0b';
                    break;
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data handle methods
    // -----------------------------------------------------------------------------------------------------

    // Calls the get data method for the blocked days and remote request days in order to merge them dynamically
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

    // Handles the cancel remote work request
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

    // Handles the add remote work request
    addRequest(remoteWorkRequest: RemoteWorkRequest): void {
        this.collaboratorService
            .addRemoteWorkRequest(this.user.idUser, remoteWorkRequest)
            .subscribe({
                next: (response: RemoteWorkRequest) => {
                    // Handle successful response
                    console.log(
                        'Remote Work Request added successfully:',
                        response
                    );
                },
                error: (error: any) => {
                    // Handle error response
                    console.error('Error adding remote work request:', error);

                },
            });
    }

    // Updates the remote work request
    updateRemoteWorkRequest(updateRequest: UpdateRemoteWorkRequest): void {
        this.collaboratorService
            .updateRemoteWorkRequest(updateRequest)
            .subscribe({
                next: (response: RemoteWorkRequest) => {
                    // Handle successful response
                    console.log(
                        'Remote Work Request updated successfully:',
                        response
                    );
                    // Optionally update the UI or show a success message
                },
                error: (error: any) => {
                    // Handle error response
                    console.error('Error updating remote work request:', error);

                },
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Condition verification methods
    // -----------------------------------------------------------------------------------------------------

    // Verify if the current date has a blocked Day
    isBlockedDayExists(date: Date): boolean {
        return this.blockedDays.some(
            (request) =>
                new Date(request.blockedDate).toDateString() ===
                date.toDateString()
        );
    }

    // Verify the limit of the collaborators onsite before adding a new remote work request
    canAddRemoteWorkRequest(date: Date): boolean {
        const approvedRequestsOnDate = this.remoteWorkRequests.filter(
            (request) =>
                new Date(request.requestDate).toDateString() ===
                    date.toDateString() &&
                request.requestStatus === RemoteWorkRequestStatus.APPROVED
        );
        return approvedRequestsOnDate.length < this.maxApprovedRequestsPerDay;
    }

    // Verify the limit of remote work requests for each month
    canAddRemoteWorkRequestForMonth(date: Date): boolean {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const approvedRequestsInMonth = this.remoteWorkRequests.filter(
            (request) =>
                new Date(request.requestDate) >= startOfMonth &&
                new Date(request.requestDate) <= endOfMonth &&
                request.requestStatus === RemoteWorkRequestStatus.APPROVED
        );
        return (
            approvedRequestsInMonth.length < this.maxApprovedRequestsPerMonth
        );
    }
}
