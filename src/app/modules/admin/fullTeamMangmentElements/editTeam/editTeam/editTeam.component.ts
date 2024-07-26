import { Component, Inject, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationConfig } from '@fuse/services/confirmation';
import { FuseValidators } from '@fuse/validators';
import { Team } from 'app/core/entities/Team';
import { User } from 'app/core/entities/User';

@Component({
    selector: 'app-editTeam',
    templateUrl: './editTeam.component.html',
    styles: [
        `
            .fuse-confirmation-dialog-panel {
                @screen md {
                    @apply w-128;
                }

                .mat-mdc-dialog-container {
                    .mat-mdc-dialog-surface {
                        padding: 0 !important;
                    }
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTeamComponent implements OnInit {
    public managers: User[] = [];
    public currentTeam: Team;
    public editTeamForm: FormGroup;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<EditTeamComponent>,
        private cdr: ChangeDetectorRef
    ) {       // Set up current team and managers
        this.setUpCurrentTeam(this.data);}

    ngOnInit(): void {
 

        // Initialize the form
        this.editTeamForm = this.fb.group({
            teamName: [
                this.currentTeam?.teamName || '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(20),
                    FuseValidators.stringInputValidator(),
                ],
            ],
            description: [
                this.currentTeam?.description || '',
                [FuseValidators.stringInputValidator()],
            ],
            currentManager: [
                { value: this.currentTeam?.manager?.fullName || '', disabled: true },
            ],
            newManager: [''],
        });
    }

    setUpCurrentTeam(data: any): void {
        this.currentTeam = new Team(
            data.team.idTeam,
            data.team.teamName,
            data.team.description,
            data.team.onsiteEmployees,
            data.team.manager
        );
        this.managers = data.managers || [];
    }

    onSubmit(): void {
        if (this.editTeamForm.valid) {
            const newTeam = this.editTeamForm.getRawValue();
            newTeam.onsiteEmployees = this.currentTeam.onsiteEmployees;
            newTeam.idTeam = this.currentTeam.idTeam;


            if (this.hasChanges(newTeam)) {
                this.dialogRef.close({
                    status: 'confirmed',
                    updatedTeam: newTeam,
                });
            } else {
                console.log('No changes detected');
            }
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

    onCancel(): void {
        this.dialogRef.close({
            status: 'cancelled',
        });
    }
}
