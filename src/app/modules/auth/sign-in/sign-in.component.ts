import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    NgForm,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { SessionService } from 'app/core/auth/Session/session.service';
import { Role } from 'app/core/entities/Role';
import { Team } from 'app/core/entities/Team';
import { AdminService } from 'app/core/services/admin/admin.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _sessionService: SessionService,
        private _adminService: AdminService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: [
                'john.doe@example.com',
                [Validators.required, Validators.email],
            ],
            password: ['password123', Validators.required],
            rememberMe: [''],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            (response) => {
                // Set the redirect url.
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) || '/signed-in-redirect';

                // Calling all the users init functions
                this.admiInit();

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            (error) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Log the error to the console for debugging
                console.error('Sign-in error:', error);

                // Handle different types of errors based on the error response
                if (error.status === 400) {
                    // Example: Handle bad request errors
                    this.alert = {
                        type: 'error',
                        message: 'Invalid email or password. Please try again.',
                    };
                } else if (error.status === 401) {
                    // Example: Handle unauthorized errors
                    this.alert = {
                        type: 'error',
                        message: 'Unauthorized. Please check your credentials.',
                    };
                } else if (error.status === 500) {
                    // Example: Handle server errors
                    this.alert = {
                        type: 'error',
                        message: 'Server error. Please try again later.',
                    };
                } else {
                    // Handle unknown errors
                    this.alert = {
                        type: 'error',
                        message: 'An unknown error occurred. Please try again.',
                    };
                }

                // Show the alert
                this.showAlert = true;
            }
        );
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Users methods
    // -----------------------------------------------------------------------------------------------------
    admiInit() {
        if (this._sessionService.getUser().role == Role.ADMINISTRATOR) {
            this._adminService.getAllTeams().subscribe({
                next: (data: Team[]) => {
                    this._sessionService.saveAllTeams(data);
                    console.log(
                        '***************:',
                        this._sessionService.getTeams()
                    );
                },
                error: (error) => {
                    console.error('Error fetching teams:', error);
                },
            });
        }
    }
}
