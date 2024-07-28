import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { teamManagmentComponent } from './teamManagment.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
const exampleRoutes: Route[] = [
    {
        path: '',
        component: teamManagmentComponent,
    },
];

@NgModule({
    declarations: [teamManagmentComponent],
    imports: [RouterModule.forChild(exampleRoutes),     
        CommonModule,  
        MatTableModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule, // Add ReactiveFormsModule if you're using reactive forms,
        MatPaginatorModule

    ],
})
export class teamManagmentModule {}
