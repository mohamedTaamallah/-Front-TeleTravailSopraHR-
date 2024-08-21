import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { GridModule, Filter, Sort, FilterService, ToolbarService, PageService,PrintEventArgs, EditService, ForeignKeyService, GroupService, Toolbar, ColumnMenuService, SortService } from '@syncfusion/ej2-angular-grids';
import { RemoteWorkRequestListComponent } from './RemoteWorkRequestList.component';
import {  DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: RemoteWorkRequestListComponent
    }
];

@NgModule({
    declarations: [
        RemoteWorkRequestListComponent
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes),
        GridModule,
        DropDownListModule
    ],
    providers:[GroupService,EditService,SortService, GroupService, ColumnMenuService, PageService, FilterService,ToolbarService]
})
export class RemoteWorkRequestListModule
{
}
