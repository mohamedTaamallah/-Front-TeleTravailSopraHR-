import { Component, ViewEncapsulation } from '@angular/core';
import { extend } from '@syncfusion/ej2-base';
import { EventSettingsModel, View, EventRenderedArgs, DayService, WeekService, WorkWeekService, MonthService, AgendaService, ResizeService, DragAndDropService, ScheduleModule, MonthAgendaService, TimelineViewsService, TimelineMonthService } from '@syncfusion/ej2-angular-schedule'

@Component({
    selector     : 'example',
    templateUrl  : './collaboratorScheduler.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService]

})
export class collaboratorSchedulerComponent
{
    /**
     * Constructor
     */
    constructor()
    {

    }

    public selectedDate: Date = new Date(2021,6, 10);
    public eventSettings: EventSettingsModel = { dataSource: extend([], null, true) as Record<string, any>[] };
}


