import { ChangeDetectorRef, Component, Inject, Query } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationConfig } from '@fuse/services/confirmation';
import { FuseValidators } from '@fuse/validators';
import { Team } from 'app/core/entities/Team';
import { User } from 'app/core/services/user/user.types';
import { EditTeamComponent } from 'app/modules/admin/fullTeamMangmentElements/editTeam/editTeam.component';

@Component({
    selector: 'app-add-team',
    templateUrl: './addCollaborator.component.html',
})
export class AddCollaboratorToTeamComponent {
    public collaborators: any[] = [];
    public query: Query;
    public fields: Object = { text: 'email', value: 'idUser' };
    public text: string = 'Select an email';
    public sorting: string = 'Ascending';
    public selectedCollaborator: any;


    constructor(
        @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
        private dialogRef: MatDialogRef<EditTeamComponent>
    ) {
        this.setUpCurrentAvailableManagers(data);
    }

    ngOnInit(): void {
        
    }

    setUpCurrentAvailableManagers(data: any): void {
        // Extract only the numbered keys from the data object
        const collaboratorsArray = Object.keys(data)
            .filter(key => !isNaN(Number(key))) // Filter out non-numeric keys like 'actions', 'dismissible', etc.
            .map(key => data[key]) // Map to the corresponding collaborator objects
            .map(({ idUser, fullName, email }: any) => ({
                idUser,
                fullName,
                email
            }));
    
        // Assign the transformed array to the collaborators property
        this.collaborators = collaboratorsArray;
    
        console.log('Transformed Collaborators:', this.collaborators);
    }

    onSubmit(): void {
        if (this.selectedCollaborator != null) {
            console.log("")
            this.dialogRef.close({
                status: 'confirmed',
                selectedCollaborator :this.selectedCollaborator
            });
        } else {
            console.log('the selected Collaborator is empty');
        }
    }


 
    onFiltering(e: any): void {
    }

    onCancel(): void {
        this.dialogRef.close({
            status: 'cancelled',
        });
    }
    
    onSelectionChange(event: any): void {
        this.selectedCollaborator = event.itemData;
        console.log('Selected Collaborator:', this.selectedCollaborator);
    }



    
 

}
