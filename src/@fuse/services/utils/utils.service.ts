import { Injectable } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import {
    EventSettingsModel,
    PopupOpenEventArgs,
} from '@syncfusion/ej2-angular-schedule';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { StudySchedule } from 'app/core/entities/StudySchedule';
import { User } from 'app/core/entities/User';

@Injectable({
    providedIn: 'root',
})
export class FuseUtilsService {
    private user: User;
    /**
     * Constructor
     */
    constructor() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ Scheduler settings methods
    // -----------------------------------------------------------------------------------------------------

    // Transform the blocked Days to events
    transformBlockedDaysToEvents(
        blockedDays: BlockedDay[],
        user: User
    ): Record<string, any>[] {
        return blockedDays.map((day) => ({
            Id: `blocked_${day.idBlockedDay}`,
            Subject: `Blocked Day [${day.reason}]`,
            StartTime: new Date(day.blockedDate),
            EndTime: new Date(day.blockedDate),
            IsAllDay: true,
            IsBlockedDay: true,
            Reason: day.reason,
            // Team: user.userTeam.teamName,
        }));
    }

    // Transform the remote work requests to events
    transformRemoteWorkRequestsToEvents(
        remoteWorkRequests: RemoteWorkRequest[],
        user: User
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
            User: user,
        }));
    }

    // Transform the study days to events
    transformStudyDaysToEvents(user: User): Record<string, any>[] {
        const events: Record<string, any>[] = [];
        const studyDays = user.studySchedule?.daysOfStudy || [];
        const isTwoFirstWeek = user.studySchedule?.isTwoFirstWeek || false;

        // Loop through each day of the month and check if it's a study day
        for (let month = 0; month < 12; month++) {
            // Loop through each month
            const year = new Date().getFullYear();
            const endOfMonth = new Date(year, month + 1, 0);
            if (month === 7) {
                continue;
            }
            for (let day = 1; day <= endOfMonth.getDate(); day++) {
                const currentDate = new Date(year, month, day);

                if (
                    this.isInWeekRange(currentDate, isTwoFirstWeek) &&
                    studyDays.includes(currentDate.getDay() + 1)
                ) {
                    events.push({
                        Id: `study_${month}_${day}`,
                        Subject: `Study Day`,
                        StartTime: new Date(currentDate.setHours(0, 0, 0, 0)),
                        EndTime: new Date(
                            currentDate.setHours(23, 59, 59, 999)
                        ),
                        IsAllDay: true,
                        IsStudyDay: true,
                        User: user.fullName,
                    });
                }
            }
        }

        return events;
    }

    updateEventSettings(
        blockedDays: BlockedDay[],
        remoteWorkRequests: RemoteWorkRequest[],
        user: User,
        eventSettings: EventSettingsModel
    ): EventSettingsModel {
        return {
            ...eventSettings,
            dataSource: [
                ...this.transformBlockedDaysToEvents(blockedDays, user),
                ...this.transformRemoteWorkRequestsToEvents(
                    remoteWorkRequests,
                    user
                ),
                ...this.transformStudyDaysToEvents(user),
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

    /**
     * Get the equivalent "IsActiveMatchOptions" options for "exact = true".
     */
    get exactMatchOptions(): IsActiveMatchOptions {
        return {
            paths: 'exact',
            fragment: 'ignored',
            matrixParams: 'ignored',
            queryParams: 'exact',
        };
    }

    /**
     * Get the equivalent "IsActiveMatchOptions" options for "exact = false".
     */
    get subsetMatchOptions(): IsActiveMatchOptions {
        return {
            paths: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored',
            queryParams: 'subset',
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generates a random id
     *
     * @param length
     */
    randomId(length: number = 10): string {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let name = '';

        for (let i = 0; i < 10; i++) {
            name += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return name;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Collaborator schedule  methods
    // -----------------------------------------------------------------------------------------------------

    formatDateForServer(date: Date): string {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // Adding 1 because months are 0-indexed
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    //Verifying that the date is in the current week
    getWeekRange(date: Date): { startDate: Date; endDate: Date } {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

        console.log('the date in the range method' + date);
        console.log('the day in the range method ' + date);

        const startDate = new Date(date.setDate(diff));
        const endDate = new Date(date.setDate(startDate.getDate() + 6));
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
    }

    // Helper methods to get the start and end of the week
    getStartOfWeek(date: Date): Date {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    getEndOfWeek(date: Date): Date {
        const end = new Date(this.getStartOfWeek(date));
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
    }

    // Helper function to cancel the popup and show an alert
    cancelPopup(args: PopupOpenEventArgs, message: string): void {
        args.cancel = true;
        alert(message);
    }

    //getting the related day for the student collaborator
    getDateForDayOfWeek(dayOfWeek: number): Date {
        const today = new Date();
        const day = today.getDay() || 7; // Sunday = 0, Monday = 1, etc.
        const difference = dayOfWeek - day + (dayOfWeek < day ? 7 : 0);
        return new Date(today.setDate(today.getDate() + difference));
    }

    //verify if the date in the week range
    isInWeekRange(date: Date, isTwoFirstWeek: boolean): boolean {
        const dayOfMonth = date.getDate();
        const isFirstTwoWeeks = dayOfMonth <= 14;
        const isLastTwoWeeks = dayOfMonth >= 15 && dayOfMonth <= 28;

        return isTwoFirstWeek ? isFirstTwoWeeks : isLastTwoWeeks;
    }

    // Helper method to check if the week contains study days
    isStudyWeek(weekStart: Date, weekEnd: Date, studySchedule: StudySchedule): boolean {
        // Check each day in the week if it is a study day
        let isStudyWeek = false;
        let currentDate = new Date(weekStart);

        while (currentDate <= weekEnd) {
            const dayOfWeek = currentDate.getDay() + 1; // Get the day of the week (1 = Monday, 7 = Sunday)
            const weekOfMonth = Math.ceil(currentDate.getDate() / 7); // Get the week number within the month

            // Determine if we are in the first two weeks or the last two weeks
            const isFirstTwoWeeks = weekOfMonth <= 2;
            const isLastTwoWeeks = weekOfMonth > 2;

            // Check if the current day is a study day
            if (
                (studySchedule?.isTwoFirstWeek && isFirstTwoWeeks) ||
                (!studySchedule?.isTwoFirstWeek && isLastTwoWeeks)
            ) {
                if (studySchedule?.daysOfStudy.includes(dayOfWeek)) {
                    isStudyWeek = true;
                    break;
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return isStudyWeek;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Remote work request  List manager   methods
    // -----------------------------------------------------------------------------------------------------

    //calculating the remaining time for the remote work request to be refused automatically
    calculateTimeRemaining(requestDate: string): string {
        const requestDateTime = new Date(requestDate).getTime();
        const currentDateTime = new Date().getTime();
        const timeDifference = requestDateTime - currentDateTime;

        if (timeDifference <= 0) {
            return 'Expired';
        }

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
            (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );

        return `${days}d ${hours}h ${minutes}m`;
    }
}
