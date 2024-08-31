import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    FuseConfirmationConfig,
    FuseConfirmationService,
} from '@fuse/services/confirmation';
import { FuseValidators } from '@fuse/validators';
import { User } from 'app/core/entities/User';

@Component({
    selector: 'app-SchedulerParamaeters',
    templateUrl: './SchedulerParamaeters.component.html',
})
export class SchedulerParamaetersComponent implements OnInit {
    public daysOfWeek: any[]  = [
        { value: 1, viewValue: 'Monday' },
        { value: 2, viewValue: 'Tuesday' },
        { value: 3, viewValue: 'Wednesday' },
        { value: 4, viewValue: 'Thursday' },
        { value: 5, viewValue: 'Friday' },
        { value: 6, viewValue: 'Saturday' },
    ];

    public studyParamaetersForm: FormGroup;
    public user: User;
    public userRoleValues : any[] = [ {value: false, viewValue:'Collaborator'}, {value: true, viewValue:'Collaborator (Student)'}];
    
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
        private _formBuilder: UntypedFormBuilder
    ) {}

    ngOnInit() {

        //getting the user informations form the scheduler
        this.setUpCurrentUserInformation(this.data)

        const initialRole = this.user.isAlternate ? this.userRoleValues[1] : this.userRoleValues[0];

        this.studyParamaetersForm = this._formBuilder.group({
            role: [initialRole, Validators.required],
            isTwoFirstWeek: [this.user.studySchedule.isTwoFirstWeek, Validators.required],
            daysOfStudy: [
                this.user.studySchedule.daysOfStudy,
                [Validators.required, FuseValidators.exactlyTwoDaysValidator()],
            ],
        });       
    
        // Initial call to set the state based on the current role
        this.onRoleChange(initialRole);
         // Subscribe to role changes
        this.studyParamaetersForm.get('role').valueChanges.subscribe((role) => {
            this.onRoleChange(role);
        });
        
    }

    setUpCurrentUserInformation(data: any): void {
        this.user = data.userInformations;
        console.log(this.user)
    }

    onRoleChange(role: any): void {
        const isTwoFirstWeekControl = this.studyParamaetersForm.get('isTwoFirstWeek');
        const daysOfStudyControl = this.studyParamaetersForm.get('daysOfStudy');

        if (role.value === true) {
            isTwoFirstWeekControl.enable();
            daysOfStudyControl.enable();
            isTwoFirstWeekControl.setValidators([Validators.required]);
            daysOfStudyControl.setValidators([Validators.required, FuseValidators.exactlyTwoDaysValidator()]);
        } else {
            isTwoFirstWeekControl.disable();
            daysOfStudyControl.disable();
            isTwoFirstWeekControl.clearValidators();
            daysOfStudyControl.clearValidators();
        }

        isTwoFirstWeekControl.updateValueAndValidity();
        daysOfStudyControl.updateValueAndValidity();
    }

    //to make sure to display the correct type of role 
    setUpInitialUserState(){

    }
}
