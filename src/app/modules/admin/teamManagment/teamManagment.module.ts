import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { teamManagmentComponent } from './teamManagment.component';
import { FilterService, ToolbarService, PageService, EditService, GridModule } from '@syncfusion/ej2-angular-grids';
import { CommonModule } from '@angular/common';

const exampleRoutes: Route[] = [
    {
        path: '',
        component: teamManagmentComponent,
    },
];

@NgModule({
    declarations: [teamManagmentComponent],
    imports: [RouterModule.forChild(exampleRoutes),       
        GridModule,
        CommonModule,],
    providers: [FilterService, ToolbarService, PageService, EditService],
})
export class teamManagmentModule {}
