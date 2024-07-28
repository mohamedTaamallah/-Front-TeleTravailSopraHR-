import {
    ChangeDetectorRef,
    Component,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Sort } from '@syncfusion/ej2-angular-grids';
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
import { BehaviorSubject } from 'rxjs';
import { AllTeamsCountRequest } from 'app/core/entities/responses/AllTeamsCountRequest ';

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
        'TeamMembers',
        'Manager',
        'Edit',
    ];
    TeamNumbers: number;

    dataSource: MatTableDataSource<AllTeamsCountRequest> =
        new MatTableDataSource<AllTeamsCountRequest>();
    teamsSubject: BehaviorSubject<AllTeamsCountRequest[]> = new BehaviorSubject<
        AllTeamsCountRequest[]
    >([]);

    configForm!: UntypedFormGroup;
    emailForm: FormGroup;
    public managers: User[] = [];

    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private fb: FormBuilder,
        private _adminService: AdminService,
        private cdr: ChangeDetectorRef
    ) {
        this.getAllManagers();
    }

    ngOnInit(): void {
        this.getAllTeams();
        this.emailForm = this.fb.group({
            email: [''], // Email field with required and email validators
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Form and display methods
    // -----------------------------------------------------------------------------------------------------

    updateDataList(team: any, operation : string ) {
        const currentTeams = this.teamsSubject.getValue();
        const index = currentTeams.findIndex(
            (t: AllTeamsCountRequest) =>
                t.team.idTeam === team.idTeam
        );

        if (index !== -1) {
            console.log(currentTeams[index].team);

            currentTeams[index].team = team;
        } else {
            
            currentTeams.push(new AllTeamsCountRequest(team,0));
        }

        this.teamsSubject.next(currentTeams);
        this.dataSource.data = currentTeams; // Update the MatTableDataSource
        operation == "edit" ? this.onUpdateTeam(currentTeams[index].team) : this.onAddTeam(team)
        this.getAllManagers();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Dialog Opening methods
    // -----------------------------------------------------------------------------------------------------

    openEditDialog(team: Team): void {
        //this.initForm();
        const managers = this.managers;

        const dialogRef2 = this._fuseConfirmationService.openEditTeam({
            team,
            managers,
        });

        dialogRef2
            .afterClosed()
            .subscribe((result: { status: string; updatedTeam: Team }) => {
                if (result) {
                    if (result.status === 'confirmed' && result.updatedTeam) {
                        this.updateDataList(result.updatedTeam,"edit");
                    } else if (result.status === 'cancelled') {
                        console.log('Operation cancelled');
                    }
                }
            });
    }

    openAddDialog(): void {
        const managers = this.managers
        const dialogRef2 = this._fuseConfirmationService.openAddTeam({
            managers,
        });

        dialogRef2
            .afterClosed()
            .subscribe((result: { status: string; newTeam: Team }) => {
                if (result) {
                    if (result.status === 'confirmed' && result.newTeam) {
                        this.updateDataList(result.newTeam,"add")
                    } else if (result.status === 'cancelled') {
                        console.log('Operation cancelled');
                    }
                }
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data treatment methods
    // -----------------------------------------------------------------------------------------------------
    getAllManagers(): User [] {
        this._adminService.getAllManagers().subscribe({
            next: (data: any) => {
                this.cdr.detectChanges(); // Ensure change detection runs
                this.managers = data as User[]; // Cast the data to User[]
            },
            error: (error) => {
                console.error('Error fetching managers:', error);
            },
        });
        return this.managers

    }

    getAllTeams(): void {
        this._adminService.getAllTeams().subscribe({
            next: (data: AllTeamsCountRequest[]) => {
                this.teamsSubject.next(data); // Update the BehaviorSubject
                this.dataSource.data = data; // Update the BehaviorSubject
                this.TeamNumbers = data.length;
            },
            error: (error) => {
                console.error('Error fetching teams:', error);
            },
        });
    }

    onUpdateTeam(team: Team): void {
        this._adminService.updateTeam(team).subscribe({
            next: (updatedTeam) => {
                console.log('Team updated successfully:', updatedTeam);
                this.getAllManagers();

                // Handle the updated team, update UI or refresh data if necessary
            },
            error: (error) => {
                console.error('Error updating team:', error);
            },
        });
    }



    onAddTeam(team: Team): void {
        this._adminService.createTeam(team).subscribe({
            next: (newTeam) => {
                console.log('Team added successfully:', newTeam);

                // Handle the updated team, update UI or refresh data if necessary
            },
            error: (error) => {
                console.error('Error updating team:', error);
            },
        });
    }





    // -----------------------------------------------------------------------------------------------------
    // @ Filter related methods
    // -----------------------------------------------------------------------------------------------------

    onSearchChange(event: Event) {
        this.searchTerm = (event.target as HTMLInputElement).value;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /** Announce the change in sort state for assistive technology. */
    announceSortChange(sortState: Sort) {}

    applyFilter(searchTerm: string): void {
        this.searchTerm = searchTerm.trim().toLowerCase();
    }
}
