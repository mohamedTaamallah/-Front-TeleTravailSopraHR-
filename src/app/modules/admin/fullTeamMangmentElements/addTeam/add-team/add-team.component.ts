import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationConfig } from '@fuse/services/confirmation';
import { FuseValidators } from '@fuse/validators';
import { Team } from 'app/core/entities/Team';
import { User } from 'app/core/user/user.types';
import { EditTeamComponent } from '../../editTeam/editTeam.component';

@Component({
    selector: 'app-add-team',
    templateUrl: './add-team.component.html',
})
export class AddTeamComponent {
    public managers: User[] = [];
    public currentTeam: Team;
    public addTeamForm: FormGroup;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<EditTeamComponent>
    ) {
        this.setUpCurrentAvailableManagers(data);
    }

    ngOnInit(): void {
        // Initialize the form
        this.addTeamForm = this.fb.group({
            teamName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(20),
                    FuseValidators.stringInputValidator(),
                ],
            ],
            description: ['', [FuseValidators.stringInputValidator()]],
            onsiteEmployees: [
                '',
                [
                    FuseValidators.lengthFormatValidator(0, false),
                    Validators.required,
                ],
            ],
            manager: [
                '',
                [
                    Validators.required,
                ],
            ],
        });
    }

    setUpCurrentAvailableManagers(data: any): void {
        this.managers = data.managers || [];
    }

    onSubmit(): void {
        if (this.addTeamForm.valid) {
            const newTeam = this.addTeamForm.getRawValue();
            this.dialogRef.close({
                status: 'confirmed',
                newTeam: newTeam,
            });
        } else {
            console.log('Form invalid');
        }
    }

    hasChanges(newTeam: any): boolean {
        return (
            this.currentTeam.teamName !== newTeam.teamName ||
            this.currentTeam.description !== newTeam.description ||
            newTeam.newManager !== ''
        );
    }

    // updateCurrentManager(newTeam: any) {
    //     if (this.hasChanges(newTeam)) {
    //         //checking if we need to affect the current manager to the new one if its empty
    //         this.currentTeam.teamName = newTeam.teamName;
    //         this.currentTeam.description = newTeam.description;
    //         if (newTeam.newManager != '')
    //             this.currentTeam.manager = newTeam.newManager;
    //         this.dialogRef.close({
    //             status: 'confirmed',
    //             updatedTeam: this.currentTeam,
    //         });
    //     } else {
    //         console.log('No changes detected');
    //     }
    // }

    onCancel(): void {
        this.dialogRef.close({
            status: 'cancelled',
        });
    }
}
