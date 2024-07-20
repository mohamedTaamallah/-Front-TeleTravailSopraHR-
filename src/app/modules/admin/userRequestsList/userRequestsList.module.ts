import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import {  userRequestsListComponent } from 'app/modules/admin/userRequestsList/userRequestsList.component';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: userRequestsListComponent
    }
];

@NgModule({
    declarations: [
        userRequestsListComponent
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes)
    ]
})
export class ExampleModule
{
}
