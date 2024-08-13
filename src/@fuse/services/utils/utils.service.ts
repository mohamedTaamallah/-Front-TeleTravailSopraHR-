import { Injectable } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import { PopupOpenEventArgs } from '@syncfusion/ej2-angular-schedule';

@Injectable({
    providedIn: 'root',
})
export class FuseUtilsService {
    /**
     * Constructor
     */
    constructor() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

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
}
