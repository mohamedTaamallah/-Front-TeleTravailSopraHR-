import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { BlockedDaysManagment } from './BlockedDaysManagment.component';
import { ScheduleModule } from '@syncfusion/ej2-angular-schedule';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: BlockedDaysManagment
    }
];

@NgModule({
    declarations: [
        BlockedDaysManagment
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes),
        ScheduleModule,

    ]
})
export class BlockedDaysManagmentModule
{
}
