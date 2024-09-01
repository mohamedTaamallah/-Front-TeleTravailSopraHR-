import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    FuseConfirmationConfig,
    FuseConfirmationService,
} from '@fuse/services/confirmation';
import { FuseValidators } from '@fuse/validators';
import { StudySchedule } from 'app/core/entities/StudySchedule';
import { User } from 'app/core/entities/User';
import { EditTeamComponent } from 'app/modules/admin/fullTeamMangmentElements/editTeam/editTeam.component';

@Component({
    selector: 'app-SchedulerParamaeters',
    templateUrl: './SchedulerParamaeters.component.html',
})
export class SchedulerParamaetersComponent implements OnInit {
    public daysOfWeek: any[] = [
        { value: 2, viewValue: 'Monday' },
        { value: 3, viewValue: 'Tuesday' },
        { value: 4, viewValue: 'Wednesday' },
        { value: 5, viewValue: 'Thursday' },
        { value: 6, viewValue: 'Friday' },
        { value: 7, viewValue: 'Saturday' },
    ];

    public studyParamaetersForm: FormGroup;
    public user: User;
    public userRoleValues: any[] = [
        { value: false, viewValue: 'Collaborator' },
        { value: true, viewValue: 'Collaborator (Student)' },
    ];
    public initialDaysOfStudy: any;
    public initiaIsTwoFirstWeek: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
        private _formBuilder: UntypedFormBuilder,
        private dialogRef: MatDialogRef<EditTeamComponent>
    ) {}

    ngOnInit() {
        //getting the user informations form the scheduler
        this.setUpCurrentUserInformation(this.data);

        const initialRole = this.user.isAlternate
            ? this.userRoleValues[1]
            : this.userRoleValues[0];

        const { studySchedule } = this.user || {};
        const initialIsTwoFirstWeek = studySchedule?.isTwoFirstWeek ;
        const initialDaysOfStudy = studySchedule?.daysOfStudy || null;


        this.studyParamaetersForm = this._formBuilder.group({
            role: [initialRole || '', Validators.required],
            isTwoFirstWeek: [initialIsTwoFirstWeek, Validators.required],
            daysOfStudy: [
                initialDaysOfStudy,
                [Validators.required, FuseValidators.exactlyTwoDaysValidator()],
            ],
        });
        this.studyParamaetersForm.get('isTwoFirstWeek').setValue(initialIsTwoFirstWeek);


        // Initial call to set the state based on the current role
        this.onRoleChange(initialRole);
        // Subscribe to role changes
        this.studyParamaetersForm.get('role').valueChanges.subscribe((role) => {
            this.onRoleChange(role);
        });
    }

    setUpCurrentUserInformation(data: any): void {
        this.user = data.userInformations;
    }

    onRoleChange(role: any): void {
        const isTwoFirstWeekControl =
            this.studyParamaetersForm.get('isTwoFirstWeek');
        const daysOfStudyControl = this.studyParamaetersForm.get('daysOfStudy');

        if (role.value === true) {
            isTwoFirstWeekControl.enable();
            daysOfStudyControl.enable();
            isTwoFirstWeekControl.setValidators([Validators.required]);
            daysOfStudyControl.setValidators([
                Validators.required,
                FuseValidators.exactlyTwoDaysValidator(),
            ]);
        } else {
            isTwoFirstWeekControl.disable();
            daysOfStudyControl.disable();
            isTwoFirstWeekControl.clearValidators();
            daysOfStudyControl.clearValidators();
        }

        isTwoFirstWeekControl.updateValueAndValidity();
        daysOfStudyControl.updateValueAndValidity();
    }

    //Submit the Result to the main component
    onSubmit(): void {
        let studySchedule = new StudySchedule();
        let isAlternate = this.studyParamaetersForm.get('role').value
        console.log(this.studyParamaetersForm.get('role').value.value)
        if (this.studyParamaetersForm.get('role').value.value === true) {
            studySchedule = new StudySchedule(
                this.user.studySchedule?.idDay,
                this.studyParamaetersForm.get('isTwoFirstWeek').value,
                this.studyParamaetersForm.get('daysOfStudy').value
            );
        }
    
        this.dialogRef.close({
            status: 'confirmed',
            isAlternate: this.studyParamaetersForm.get('role').value,
            studySchedule: studySchedule,
            
        });

    }
}
