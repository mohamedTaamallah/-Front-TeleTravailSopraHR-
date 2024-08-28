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

                this.onDeleteRemoteWorkRequest(remoteWorkRequestId);
            }
        }
        // Handle save event
        if (args.requestType === 'eventSave') {
            const eventData = args.data;

            this.handleUpdateEvent(eventData);
        }
        if (args.requestType === 'eventCreate') {
            const eventData = args.data;
            this.handleSaveEvent(eventData);
        }
    }

    // Controls the event of the pop up of the add and detail
    onPopupOpen(args: PopupOpenEventArgs): void {
        const event = args.data;
        const requestDate = event.StartTime;
        const status = event.Status;

        if (args) {
            this.presetTitleAndDescription(args);
        }
        // If the target is the scheduler cell (date), apply the logic in the else block
        if (
            (args.type === 'Editor' || args.type === 'QuickInfo') &&
            !args.target.classList.contains('e-appointment')
        ) {
            // Logic for clicking on a date in the scheduler

            if (this.isRemoteWorkRequestExists(requestDate, this.user.idUser)) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'A remote work request already exists for this day.'
                );
                return;
            }
            if (this.isStudyDayCheck(requestDate)) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'You cannot add a remote work request on a study day.'
                );
                return;
            }
            if (this.isRemoteWorkRequestExists(requestDate, this.user.idUser)) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'A remote work request already exists for this day.'
                );
                return;
            }
            if (this.isBlockedDayExists(requestDate)) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'A Blocked Day exists for this day.'
                );
                return;
            }
            if (this.hasExceededPendingRequestsForWeek(requestDate)) {
                // Step 2: Validate request based on weekly pending limits
                this._fuseUtilsService.cancelPopup(
                    args,
                    'You cannot add more than 2 pending remote work requests in the same week.'
                );
                return;
            }
            if (requestDate < new Date()) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'You cannot add a remote work request for a date in the past.'
                );
                return;
            }
            if (!this.canAddRemoteWorkRequestForWeek(requestDate)) {
                this._fuseUtilsService.cancelPopup(
                    args,
                    'You can only add one remote work request per week.'
                );
                return;
            }

            // if (this.hasExceededPendingRequestsForMonth(requestDate)) {
            //     // Step 2: Validate request based on weekly pending limits
            //     this._fuseUtilsService.cancelPopup(
            //         args,
            //         'Remote work requests can only be added for the current month.'
            //     );
            //     return;
            // }
        } else {
            // Step 1: Validate against blocked days or existing remote work requests
            this.checkEventSettings(args, status);
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

    //handels the save process
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

        //we letting the validation determine the add or not 
        this.validateRemoteRequest(remoteWorkRequest)
        //this.addRequest(remoteWorkRequest);
    }

    // Verify if the current date has an already remote request for the same user
    isRemoteWorkRequestExists(date: Date, userId: number): boolean {
        return this.remoteWorkRequests.some(
            (request) =>
                new Date(request.requestDate).toDateString() ===
                    date.toDateString() && Number(request.user.idUser) == userId
        );
    }

    isStudyDayCheck(date: Date): boolean {
        const dayOfWeek = date.getDay()+1; // Get the day of the week (0 = Sunday, 6 = Saturday)
        const weekOfMonth = Math.ceil(date.getDate() / 7); // Get the week number within the month
        // Exclude August (7 = August since months are 0-indexed)
        if (date.getMonth() === 7) {
            return false;
        }

        // Determine if we are in the first two weeks or the last two weeks
        const isFirstTwoWeeks = weekOfMonth <= 2;
        const isLastTwoWeeks = weekOfMonth > 2;

        // Check if the current week falls within the specified study weeks
        if (
            (this.user.studySchedule.isTwoFirstWeek && isFirstTwoWeeks) ||
            (!this.user.studySchedule.isTwoFirstWeek && isLastTwoWeeks)
        ) {
            // Check if the current day is one of the study days
            return this.user.studySchedule.daysOfStudy.includes(dayOfWeek);
        }

        return false;
    }
    // Blocks the title and the description for the add
    presetTitleAndDescription(args: PopupOpenEventArgs) {
        const titleElement = args.element.querySelector(
            '.e-subject'
        ) as HTMLInputElement;
        if (titleElement) {
            titleElement.value = `${this.user.fullName} [Remote Work]`;
            titleElement.setAttribute('readonly', 'true');
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

    // Merge the blocked days and remote requests into event settings

    // Prevents the edit for the approved, refused and blocked days
    checkEventSettings(args: Record<string, any>, status: any) {
        const eventData = args.data;

        const quickPopup: HTMLElement = args.element.querySelector(
            '.e-quick-popup-wrapper .e-event-popup'
        );
        const editButton: HTMLElement = quickPopup.querySelector(
            '.e-header-icon-wrapper .e-edit'
        );

        console.log('Event Data:', eventData);
        if (status != RemoteWorkRequestStatus.PENDING) {
            const deleteButton: HTMLElement = quickPopup.querySelector(
                '.e-header-icon-wrapper .e-delete'
            );
            editButton.remove();
            deleteButton.remove();
        } else {
            editButton.remove();
        }
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
                this.eventSettings = this._fuseUtilsService.updateEventSettings(
                    this.blockedDays,
                    this.remoteWorkRequests,
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

    // Handles the add remote work request
    validateRemoteRequest(remoteWorkRequest: RemoteWorkRequest): void {
        remoteWorkRequest.user = this.user
        this.collaboratorService
            .validateRemoteWorkRequest(remoteWorkRequest)
            .subscribe({
                next: (response: any) => {
                    // Handle successful response
                    console.log(
                        'Remote Work Request Validation',
                        response
                    );
                    if(response.success == false){
                        alert(response.message)
                    }
                    this.onFetchData();
                },
                error: (error: any) => {
                    // Handle error response
                    console.error('Error adding remote work request:', error);
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
        this._fuseUtilsService.updateEventSettings(
            this.blockedDays,
            this.remoteWorkRequests,
            this.user,
            this.eventSettings
        );
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

    //prohibit the from adding a remote work request other than the current month
    hasExceededPendingRequestsForMonth(requestDate: Date) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const eventMonth = requestDate.getMonth();
        const eventYear = requestDate.getFullYear();

        return currentMonth !== eventMonth || currentYear !== eventYear;
    }

    //checks if there is one pending request for a week with study days
    canAddRemoteWorkRequestForWeek(date: Date): boolean {
        const weekStart = this._fuseUtilsService.getStartOfWeek(date);
        const weekEnd = this._fuseUtilsService.getEndOfWeek(date);

        if (date.getMonth() === 7) {
            //no study days should be visible for August
            return true;
        }
        // Filter approved remote work requests for the same user in the given week
        const approvedRequestsInWeek = this.remoteWorkRequests.filter(
            (request) => {
                const requestDate = new Date(request.requestDate);
                return (
                    requestDate >= weekStart &&
                    requestDate <= weekEnd &&
                    request.requestStatus === RemoteWorkRequestStatus.PENDING &&
                    request.user.idUser === this.user.idUser
                );
            }
        );

        // Return true if the number of approved requests is less than the maximum allowed
        return approvedRequestsInWeek.length < 2;
    }
}
