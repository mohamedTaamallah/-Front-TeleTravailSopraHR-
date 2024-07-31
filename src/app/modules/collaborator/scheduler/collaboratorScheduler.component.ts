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
} from '@syncfusion/ej2-angular-schedule';
import { CollaboratorService } from 'app/core/services/collaborator/collaborator.service';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { SessionService } from 'app/core/auth/Session/session.service';
import { User } from 'app/core/entities/User';
import { Role } from 'app/core/entities/Role';
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
    public userTeam : Team 

    /**
     * Constructor
     */
    constructor(
        private collaboratorService: CollaboratorService,
        private sessionService: SessionService
    ) {}

    ngOnInit(): void {
        this.user = this.sessionService.getUser();
        this.onGetTeamByUser(this.user)

    }

    onActionBegin(args: ActionEventArgs): void {
        if (args.requestType === 'eventRemove') {
            const event = args.data[0]; // assuming single event deletion
            const eventDate = new Date(event.StartTime);
            // Define the days when the delete button should be disabled (e.g., weekends)
            if (eventDate.getDay() === 0 || eventDate.getDay() === 6) {
                // Sunday or Saturday
                args.cancel = true;
                alert('Deleting events on weekends is disabled.');
            }
        }
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

    onGetTeamByUser(user: User) {
        if (user.role === Role.COLLABORATOR) {
            this.collaboratorService.getTeamByUser(user.idUser).subscribe({
                next: (data: Team) => {
                  this.userTeam = data
                  this.onGetAllBlockedDaysByTeam(this.userTeam.idTeam)

                },
                error: (err) => {
                    console.error(err);
                },
            });
        }
    }
}
