import { Component, ViewEncapsulation } from '@angular/core';
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
export class collaboratorSchedulerComponent {
    // -----------------------------------------------------------------------------------------------------
    // @ Schedule inital Settings params  methods
    // -----------------------------------------------------------------------------------------------------
    public selectedDate: Date = new Date(2024, 6, 10);
    public eventSettings: EventSettingsModel = {
        dataSource: extend([], null, true) as Record<string, any>[],
    };
    public currentView: View = 'Month';
    public views: View[] = ['Month', 'Agenda']

    /**
     * Constructor
     */
    constructor() {}


    onActionBegin(args: ActionEventArgs): void {
      if (args.requestType === 'eventRemove') {
        const event = args.data[0]; // assuming single event deletion
        const eventDate = new Date(event.StartTime);
  
        // Define the days when the delete button should be disabled (e.g., weekends)
        if (eventDate.getDay() === 0 || eventDate.getDay() === 6) { // Sunday or Saturday
          args.cancel = true;
          alert('Deleting events on weekends is disabled.');
        }
      }
    }
}
