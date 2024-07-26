import {
    ChangeDetectorRef,
    Component,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    EditSettingsModel,
    GridComponent,
    PrintEventArgs,
    Sort,
} from '@syncfusion/ej2-angular-grids';
import { Team } from 'app/core/entities/Team';
import { createElement } from '@syncfusion/ej2-base';
import { SessionService } from 'app/core/auth/Session/session.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
    UntypedFormGroup,
    FormGroup,
    UntypedFormBuilder,
    FormBuilder,
} from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AdminService } from 'app/core/services/admin/admin.service';
import { User } from 'app/core/entities/User';

@Component({
    selector: 'example',
    templateUrl: './teamManagment.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class teamManagmentComponent {
    searchTerm: string | any = null;
    pendingUsersRequests!: User[];

    pendingUserRequestColumns: string[] = [
        'teamName',
        'Descritption',
        'OnsiteEmployees',
        'Manager',
        'Edit',
    ];
    TeamNumbers: number;

    dataSource: any;
    configForm!: UntypedFormGroup;
    emailForm: FormGroup;
    public managers: User[] = [];


    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private _liveAnnouncer: LiveAnnouncer,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private fb: FormBuilder,
        private changeDetectorRefs: ChangeDetectorRef,
        private sessionService: SessionService,
        private _adminService: AdminService,
        private cdr: ChangeDetectorRef

    ) {        this.getAllManagers()
    }

    ngOnInit(): void {
        this.dataSource = this.sessionService.getTeams();
        this.TeamNumbers = this.dataSource.length;
        this.initForm();
        this.emailForm = this.fb.group({
            email: [''], // Email field with required and email validators
        });
    }

    initForm(): void {
        this.configForm = this._formBuilder.group({
            message: '',
            // icon: this._formBuilder.group({
            //   show: true,
            //   name: 'heroicons_outline:exclamation',
            //   color: 'warn'
            // }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'Remove',
                    color: 'warn',
                }),
                cancel: this._formBuilder.group({
                    show: true,
                    label: 'Cancel',
                }),
            }),
            dismissible: true,
        });
    }

    getListPendingUsers() {}

    updateTeamInList(updatedTeam: Team): void {
        // Find the index of the team to be updated
        const index = this.dataSource.findIndex((team: Team) => team.idTeam === updatedTeam.idTeam);
        console.log(updatedTeam)

        if (index !== -1) {
            // Replace the old team with the updated team
            this.dataSource[index] = updatedTeam;
    
            // Refresh the MatTableDataSource
            this.dataSource = new MatTableDataSource(this.dataSource);
            this.TeamNumbers = this.dataSource.data.length;
    
            // Ensure change detection runs
            this.changeDetectorRefs.detectChanges();
        }
    }
    onSearchChange(event: Event) {
        this.searchTerm = (event.target as HTMLInputElement).value;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /** Announce the change in sort state for assistive technology. */
    announceSortChange(sortState: Sort) {}

    
    /**
     * Open confirmation dialog
     */
    openConfirmationDialog(team: Team, newStatus: string,): void {
        this.initForm();
        const managers = this.managers

        const dialogRef2 = this._fuseConfirmationService.openEditTeam({
            team,
            managers
        });
        // Subscribe to afterClosed from the dialog reference
        dialogRef2.afterClosed().subscribe((result: { status: string, updatedTeam?: Team }) => {
            if (result) {
                if (result.status === 'confirmed') {
                    if (result.updatedTeam) {
                        this.updateTeamInList(result.updatedTeam);

                        console.log("Updated team data:", result.updatedTeam);
                        
                        // Optionally, you can also send the updated team data to your server here
                    }
                } else if (result.status === 'cancelled') {
                    console.log('Operation cancelled');
                    // Handle cancellation if needed
                }
            }
        });
    }

    applyFilter(searchTerm: string): void {
        this.searchTerm = searchTerm.trim().toLowerCase();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data treatment methods
    // -----------------------------------------------------------------------------------------------------
    getAllManagers(): void {
        this._adminService.getAllManagers().subscribe({
            next: (data: any) => {
                this.managers = data as User[]; // Cast the data to User[]
                this.cdr.detectChanges(); // Ensure change detection runs
            },
            error: (error) => {
                console.error('Error fetching managers:', error);
            },
        });
    }
}
