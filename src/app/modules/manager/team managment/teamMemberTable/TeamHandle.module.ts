import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, GroupService, EditService, SortService, ColumnMenuService, PageService, FilterService, ToolbarService, CommandColumnService } from '@syncfusion/ej2-angular-grids';
import { TeamHandleComponent } from './TeamHandle.component';

const exampleRoutes: Route[] = [
    {
        path     : '',
        component: TeamHandleComponent
    }
];

@NgModule({
    declarations: [
        TeamHandleComponent
    ],
    imports     : [
        RouterModule.forChild(exampleRoutes),
        GridModule,
        DropDownListModule
    ],
    providers:[GroupService,EditService,SortService, GroupService, ColumnMenuService, PageService, FilterService,ToolbarService,CommandColumnService]
    
})
export class TeamHandleModule
{
}
