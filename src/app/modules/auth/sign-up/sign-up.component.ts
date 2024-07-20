import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { JwtTokenService } from 'app/core/auth/JWT/jwt-token.service';
import { User } from 'app/core/entities/User';


@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignUpComponent implements OnInit
{
    [x: string]: any;
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
    userRoleValues = [
        'AUDITEUR',
        'RESPONSABLE_ANALYSE',
        'RESPONSABLE_ADMINISTRATION',
    ];
    user: User = new User();
    ncinExistsError: boolean = false;
    countries: any[] = [];

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _jwtService: JwtTokenService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.signUpForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                nom: [
                    'qsd',
                    [
                        Validators.required,
                        Validators.minLength(3),
                        Validators.maxLength(20),
                        FuseValidators.stringInputValidator(),
                    ],
                ],
                ncin: [
                    '12121212',
                    [
                        Validators.required,
                        FuseValidators.lengthFormatValidator(8),
                    ],
                ],
                numTel: [
                    '12121212',
                    [
                        Validators.required,
                        FuseValidators.lengthFormatValidator(8),
                    ],
                ],
                email: [
                    'qsdqsd@gmail.com',
                    [Validators.required, Validators.email],
                ],
                dateNaissance: ['', Validators.required],
                sexe: ['', Validators.required],
            }),
            address: this._formBuilder.group({
                pays: [
                    'qsd',
                    [
                        Validators.required,
                        Validators.minLength(3),
                        FuseValidators.stringInputValidator(),
                    ],
                ],
                ville: [
                    'qsd',
                    [
                        Validators.required,
                        FuseValidators.stringInputValidator(),
                    ],
                ],
                numRue: [
                    '12',
                    [
                        Validators.required,
                        FuseValidators.lengthFormatValidator(2),
                    ],
                ],
                codePostale: [
                    '1211',
                    [
                        Validators.required,
                        FuseValidators.lengthFormatValidator(4),
                    ],
                ],
            }),
            step3: this._formBuilder.group({
                motDePasse: [
                    'Mohamed123@',
                    [Validators.required, FuseValidators.passwordStrength()],
                ],
                poste: ['', Validators.required],
                role: ['', Validators.required],
                dateEmbauche: ['', Validators.required],
            }),
            step4: this._formBuilder.group({
                avatar: ['', Validators.required],
            }),
        });


    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void
    {
        // Do nothing if the form is invalid
        if ( this.signUpForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign up
        this._authService.signUp(this.signUpForm.value)
            .subscribe(
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
                        type   : 'error',
                        message: 'Something went wrong, please try again.'
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }
}
