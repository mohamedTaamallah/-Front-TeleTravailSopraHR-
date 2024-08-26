import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfirmationService } from '@fuse/services/confirmation/confirmation.service';
import { FuseConfirmationDialogComponent } from '@fuse/services/confirmation/dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { EditTeamComponent } from 'app/modules/admin/fullTeamMangmentElements/editTeam/editTeam.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { AddTeamComponent } from 'app/modules/admin/fullTeamMangmentElements/addTeam/add-team/add-team.component';
import { AutoCompleteModule } from '@syncfusion/ej2-angular-dropdowns';
import { AddColaboratorComponent } from 'app/modules/manager/team managment/addCollaborator/AddColaborator/AddColaborator.component';

@NgModule({
    declarations: [
        FuseConfirmationDialogComponent,
        EditTeamComponent,
        AddTeamComponent,
        AddColaboratorComponent
    ],
    imports     : [
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        CommonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule ,
        AutoCompleteModule
    ],
    providers   : [
        FuseConfirmationService
    ]
})
export class FuseConfirmationModule
{
    /**
     * Constructor
     */
    constructor(private _fuseConfirmationService: FuseConfirmationService)
    {
    }
}
