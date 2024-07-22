import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import {  userRequestsListComponent } from 'app/modules/admin/userRequestsList/userRequestsList.component';
// import the GridModule for the Grid component
import { GridModule, Filter, Sort, FilterService, ToolbarService, PageService,PrintEventArgs, EditService } from '@syncfusion/ej2-angular-grids';
import { CommonModule } from '@angular/common';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: userRequestsListComponent
    }
];

@NgModule({
    declarations: [
        userRequestsListComponent,
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes),
        GridModule,
        CommonModule,

    ],
    providers: [
        FilterService,
        ToolbarService,
        PageService,
        EditService
        ],
})
export class  UserRequestsListModule
{
}
