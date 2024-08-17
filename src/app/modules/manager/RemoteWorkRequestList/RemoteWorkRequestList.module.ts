import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { RemoteWorkRequestListComponent } from './RemoteWorkRequestList.component';
import { GridModule, Filter, Sort, FilterService, ToolbarService, PageService,PrintEventArgs, EditService, ForeignKeyService, GroupService, Toolbar, ColumnMenuService, SortService } from '@syncfusion/ej2-angular-grids';

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
        

    ],
    providers:[GroupService,EditService,SortService, GroupService, ColumnMenuService, PageService, FilterService]
})
export class RemoteWorkRequestListModule
{
}
