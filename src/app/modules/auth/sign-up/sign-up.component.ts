import {
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    NgForm,
    Validators,
    FormGroup,
    ValidatorFn,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { JwtTokenService } from 'app/core/auth/JWT/jwt-token.service';
import { User } from 'app/core/entities/User';
import { AuthForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { Role } from 'app/core/entities/Role';
import { StudySchedule } from 'app/core/entities/StudySchedule';
import { DateTime } from 'luxon';
import { max } from 'lodash';
import { AllTeamsCountRequest } from 'app/core/entities/responses/AllTeamsCountRequest ';
import { AdminService } from 'app/core/services/admin/admin.service';
import { Team } from 'app/core/entities/Team';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthSignUpComponent implements OnInit {

    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: FormGroup;
    showAlert: boolean = false;
    // Define task and initialize it with an empty object
    task: any = {};
    confirmPassword: string;
    userRoleValues = ['COLLABORATOR', 'COLLABORATOR (Student)'];
    daysOfWeek = [
        { value: 1, viewValue: 'Monday' },
        { value: 2, viewValue: 'Tuesday' },
        { value: 3, viewValue: 'Wednesday' },
        { value: 4, viewValue: 'Thursday' },
        { value: 5, viewValue: 'Friday' },
        { value: 6, viewValue: 'Saturday' },
    ];
    user: User = new User();
    displayAlternateOption: boolean = false;

    minDate: any
    maxDate: any

    public teams : Team[] 

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef,
        private _adminService : AdminService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.getAllTeams()

        this.calculateDateRange()
        
        this.signUpForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                fullName: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(3),
                        Validators.maxLength(20),
                        FuseValidators.stringInputValidator(),
                    ],
                ],
                sopraID: [
                    '',
                    [
                        Validators.required,
                        FuseValidators.stringInputValidator(),
                    ],
                ],
                phoneNumber: [
                    '',
                    [
                        Validators.required,
                        FuseValidators.lengthFormatValidator(8,true),
                    ],
                ],
                email: [
                    '',
                    [Validators.required, Validators.email],
                ],
                team: ['', Validators.required],
            }),
            step2: this._formBuilder.group({
                password: [
                    'Mohamed123@',
                    [Validators.required, FuseValidators.passwordStrength()],
                ],
                role: ['', Validators.required],
                hiringDate: ['', Validators.required],
            }),
            step3: this._formBuilder.group({
                isTwoFirstWeek: [null, Validators.required],
                daysOfStudy: [
                    null,
                    [
                        Validators.required,
                        FuseValidators.exactlyTwoDaysValidator(),
                    ],
                ],
            }),
        });

        this.signUpForm.get('step2.role').valueChanges.subscribe((value) => {
            if (value === 'COLLABORATOR (Student)') {
                this.signUpForm
                    .get('step3.isTwoFirstWeek')
                    .setValidators([Validators.required]);
                this.signUpForm
                    .get('step3.daysOfStudy')
                    .setValidators([Validators.required,FuseValidators.exactlyTwoDaysValidator()]);

                this.displayAlternateOption = true;
            } else {
                this.signUpForm.get('step3.isTwoFirstWeek').clearValidators();
                this.signUpForm.get('step3.daysOfStudy').clearValidators();

                this.displayAlternateOption = false;
            }
            this.signUpForm
                .get('step3.isTwoFirstWeek')
                .updateValueAndValidity();

            this.signUpForm.get('step3.daysOfStudy').updateValueAndValidity();

            this.cdr.detectChanges(); // Trigger change detection manually
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        // Do nothing if the form is invalid
        if (this.signUpForm.invalid) {
            this.showAlert = true;
            return;
        }
 

        // Disable the form
        this.signUpForm.disable();

        this.mapFormDataToUser();

        

        // Hide the alert
        this.showAlert = false;

        // Sign up
        this._authService.signUp(this.user).subscribe(
            (response) => {
                // Navigate to the confirmation required page
                this._router.navigateByUrl('/confirmation-required');
            },
            (response) => {
                // Re-enable the form
                this.signUpForm.enable();

                // Reset the form
                this.signUpNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Something went wrong, please try again.',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Utils methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Loading the data form the form
     */
    mapFormDataToUser(): void {
        // Retrieve values from each form step
        const step1Values = this.signUpForm.get('step1')?.value || {};
        const step2Values = this.signUpForm.get('step2')?.value || {};
        const step3Values = this.signUpForm.get('step3')?.value || {};

        // Combine values from all steps into the user object
        this.user = {
            ...this.user, // Retain any existing properties in the user object
            ...step1Values,
            ...step2Values,
        };

        this.user.studySchedule = new StudySchedule(
            step3Values.isTwoFirstWeek,
            step3Values.daysOfStudy
        );

        this.user.userTeam = new Team(step1Values.team)


        if (step2Values.role == 'COLLABORATOR (Student)') {
            this.user.role = Role.COLLABORATOR;
            this.user.isAlternate = true;
        } else {
            this.user.isAlternate = false;
        }
        console.log(this.user)
        console.log(step1Values)


    }

    // Method to check if a field  exists already in the data base
    checkFieldExists(fieldType: string): void {
        let fieldValue: string = this.signUpForm.get(
            'step1.' + fieldType
        ).value;

        if (this.signUpForm.get('step1.' + fieldType).valid) {
            this._authService.getEmailOrSopraID(fieldValue).subscribe(
                (response) => {
                    // Field doesn't exist
                    if (response != null) {
                        this.signUpForm
                            .get('step1.' + fieldType)
                            .setErrors({ Exist: true });
                    }
                },
                (error) => {
                    // Field exists, display error message
                    this.signUpForm
                        .get('step1.' + fieldType)
                        .setErrors({ Exist: true });
                }
            );
        }
    }

    /**
     * Calculates minimum and maximum dates for the hiring date picker
     */
    calculateDateRange(): any {
        // Calculate 25 years ago from today
        this.minDate = DateTime.now().minus({ years: 25 }).toJSDate();

        // Get today's date
        this.maxDate = DateTime.now().toJSDate();
 
    }

    
    // -----------------------------------------------------------------------------------------------------
    // @ Utils methods
    // -----------------------------------------------------------------------------------------------------

    getAllTeams(): void {
        this._adminService.getAllTeamsSignUp().subscribe({
            next: (data: AllTeamsCountRequest[]) => {
                this.teams = data.map(request => request.team); // Extract the team property
                console.log(this.teams); // Verify that the teams are extracted correctl
            },
            error: (error) => {
                console.error('Error fetching teams:', error);
            },
        });
    }


}
