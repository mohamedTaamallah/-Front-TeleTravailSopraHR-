import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Error500Component } from './error-500.component';
import { error500Routes } from './error-500.routing';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
    declarations: [
        Error500Component
    ],
    imports     : [
        RouterModule.forChild(error500Routes),
        MatButtonModule
    ]
})
export class Error500Module
{
}
