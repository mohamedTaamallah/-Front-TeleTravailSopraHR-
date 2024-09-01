import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { collaboratorSchedulerComponent } from './collaboratorScheduler.component';
import { ScheduleModule } from '@syncfusion/ej2-angular-schedule';
import { FuseAlertModule } from '@fuse/components/alert';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
        ScheduleModule,
        MatButtonModule,
        MatIconModule,


        ], 
         schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class collaboratorSchedulerModule
{
    
}
