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
    public selectedDate: Date = new Date();
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
        private _fuseUtilsService: FuseUtilsService
    ) {}

    ngOnInit(): void {
        this.user = this.sessionService.getUser();
        this.maxApprovedRequestsPerDay = this.user.userTeam.onsiteEmployees;
        this.maxApprovedRequestsPerMonth = this.user.remoteWorkBalance;

        this.onFetchData();
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
                console.log(remoteWorkRequestId);

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
            const requestDate = event.StartTime;
            const isBlockedDay = event.IsBlockedDay;
            const isRemoteWork = event.IsRemoteWork;
            const status = event.Status;
            const isStudyDay = this.user.studySchedule?.daysOfStudy.includes(requestDate.getDay() + 1);


            this.presetTitleAndDescription(args);

            // Step 1: Validate against blocked days or existing remote work requests
            if (isBlockedDay || isRemoteWork) {
                this.checkEventSettings(args, status);
            } else if (
                this.isRemoteWorkRequestExists(requestDate, this.user.idUser)
            ) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'A remote work request already exists for this day.'
                );
                return;
            } else if (this.isBlockedDayExists(requestDate)) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'A Blocked Day exists for this day.'
                );
                return;
            } else if (this.hasExceededPendingRequestsForWeek(requestDate)) {
                // Step 2: Validate request based on weekly pending limits
                this._fuseUtilsService.cancelPopup(
                    args,
                    'You cannot add more than 2 pending remote work requests in the same week.'
                );
                return;
            } else if (this.hasExceededPendingRequestsForMonth(requestDate)) {
                // Step 2: Validate request based on weekly pending limits
                this._fuseUtilsService.cancelPopup(
                    args,
                    'Remote work requests can only be added for the current month.'
                );
                return;
            }else if (isStudyDay) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'You cannot add a remote work request on a study day.'
                );
                return;
            }// Step 3: Additional validations for remote work requests
            else if (isRemoteWork) {
                if (!this.canAddRemoteWorkRequestForMonth(requestDate)) {
                    this._fuseUtilsService.cancelPopup(
                        args,
                        `You cannot add more than ${this.maxApprovedRequestsPerMonth} approved remote work requests per month.`
                    );
                    return;
                }
            }

            // Step 4: Prevent requests for past dates
            if (requestDate < new Date()) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'You cannot add a remote work request for a date in the past.'
                );
                return;
            }

            // Step 5: Store the event ID for editing purposes
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
            remoteWorkRequestStatus: remoteWorkRequestStatus,
        };

        console.log(updateRequest);
        //this.updateRemoteWorkRequest(updateRequest);
    }

    handleSaveEvent(eventData: Record<string, any>): void {
        // Assuming eventData is an array of events
        const event = eventData[0];

        const remoteWorkRequest: RemoteWorkRequest = {
            user: this.user,
            requestDate: this._fuseUtilsService.formatDateForServer(
                event.StartTime
            ),
            comment: event.Description || '', // Assuming Description is the comment
            requestStatus: RemoteWorkRequestStatus.PENDING,
        };

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

    // Transform the study days to events
    transformStudyDaysToEvents(user: User): Record<string, any>[] {
        const events: Record<string, any>[] = [];
        const studyDays = user.studySchedule?.daysOfStudy || [];
        const isTwoFirstWeek = user.studySchedule?.isTwoFirstWeek || false;

    
        // Loop through each day of the month and check if it's a study day
        for (let month = 0; month < 12; month++) { // Loop through each month
            const year = new Date().getFullYear();
            const endOfMonth = new Date(year, month + 1, 0);
    
            for (let day = 1; day <= endOfMonth.getDate(); day++) {
                const currentDate = new Date(year, month, day);
                
                if (this._fuseUtilsService.isInWeekRange(currentDate, isTwoFirstWeek) && studyDays.includes(currentDate.getDay() + 1)) {
                    events.push({
                        Id: `study_${month}_${day}`,
                        Subject: `Study Day`,
                        StartTime: new Date(currentDate.setHours(0, 0, 0, 0)),
                        EndTime: new Date(currentDate.setHours(23, 59, 59, 999)),
                        IsAllDay: true,
                        IsStudyDay: true,
                        User: user.fullName,
                    });
                }
            }
        }
    
        return events;
    }

    // Merge the blocked days and remote requests into event settings
    updateEventSettings() {
        const blockedDaysEvents = this.transformBlockedDaysToEvents(
            this.blockedDays
        );
        const remoteWorkEvents = this.transformRemoteWorkRequestsToEvents(
            this.remoteWorkRequests
        );
        const studyDaysEvents = this.transformStudyDaysToEvents(this.user);
        this.eventSettings = {
            dataSource: [
                ...blockedDaysEvents,
                ...remoteWorkEvents,
                ...studyDaysEvents,
            ],
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

        // Check if the cell date is a study day
        if (
            this.user.isAlternate &&
            this.user.studySchedule.daysOfStudy.some(
                (day) =>
                    new Date(
                        this._fuseUtilsService.getDateForDayOfWeek(day)
                    ).toDateString() === DateCell
            )
        ) {
            args.element.style.backgroundColor = '#d1c4e9'; // Color for study days
            console.log('^^^^^^^^' + args);
        }

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
    onFetchData(): void {
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
                    this.handleOptimisticDelete(
                        RemoteWorkRequest.idRemoteWorkRequest
                    );
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
                    this.onFetchData();
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

    canAddRemoteWorkRequest(date: Date): boolean {
        // Get the week range for the given date
        const requestWeekRange = this._fuseUtilsService.getWeekRange(date);
        console.log();
        // Filter remote work requests within the same week and pending status
        const pendingRequestsInSameWeek = this.remoteWorkRequests.filter(
            (request) => {
                const requestDate = new Date(request.requestDate);
                const requestRange =
                    this._fuseUtilsService.getWeekRange(requestDate);

                // Check if the request date is within the same week and has a pending status
                return (
                    requestRange.startDate.getTime() ===
                        requestWeekRange.startDate.getTime() &&
                    requestRange.endDate.getTime() ===
                        requestWeekRange.endDate.getTime() &&
                    request.requestStatus === RemoteWorkRequestStatus.PENDING &&
                    request.user.idUser === this.user.idUser
                );
            }
        );

        // Return true if less than 2 pending requests exist in the same week
        return pendingRequestsInSameWeek.length < 2;
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

    //checks if there is an already pending request befor adding a new one
    hasPendingRemoteWorkRequest(userId: number): boolean {
        console.log(this.remoteWorkRequests);

        return this.remoteWorkRequests.some(
            (request) =>
                request.user.idUser === userId &&
                request.requestStatus === RemoteWorkRequestStatus.PENDING
        );
    }

    // Optimistically delete the request from the UI
    handleOptimisticDelete(remoteWorkRequestId: number): void {
        this.remoteWorkRequests = this.remoteWorkRequests.filter(
            (request) =>
                request.idRemoteWorkRequest !== Number(remoteWorkRequestId)
        );
        this.updateEventSettings();
    }

    // Helper method to check if the user has exceeded pending requests in the current week
    hasExceededPendingRequestsForWeek(requestDate: Date): boolean {
        const startOfWeek = this._fuseUtilsService.getStartOfWeek(requestDate);
        const endOfWeek = this._fuseUtilsService.getEndOfWeek(requestDate);

        const pendingRequestsThisWeek = this.remoteWorkRequests.filter(
            (request) => {
                const requestDate = new Date(request.requestDate);
                return requestDate >= startOfWeek && requestDate <= endOfWeek;
            }
        );

        return pendingRequestsThisWeek.length >= 2;
    }

    hasExceededPendingRequestsForMonth(requestDate: Date) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const eventMonth = requestDate.getMonth();
        const eventYear = requestDate.getFullYear();

        return currentMonth !== eventMonth || currentYear !== eventYear;
    }
}
