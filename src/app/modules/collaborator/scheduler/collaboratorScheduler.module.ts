import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { collaboratorSchedulerComponent } from './collaboratorScheduler.component';
import { ScheduleModule } from '@syncfusion/ej2-angular-schedule';
const exampleRoutes: Route[] = [
    {
        path     : '',
        component: collaboratorSchedulerComponent
    }
];

@NgModule({
    declarations: [
        collaboratorSchedulerComponent
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes),
        ScheduleModule
    ]
})
export class collaboratorSchedulerModule
{
    
}
