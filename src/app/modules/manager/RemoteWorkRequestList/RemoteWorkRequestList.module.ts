import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { RemoteWorkRequestListComponent } from './RemoteWorkRequestList.component';

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
        RouterModule.forChild(exampleRoutes)
    ]
})
export class RemoteWorkRequestListModule
{
}
