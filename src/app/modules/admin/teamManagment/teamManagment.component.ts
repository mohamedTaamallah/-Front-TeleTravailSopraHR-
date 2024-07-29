import {
    ChangeDetectorRef,
    Component,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Team } from 'app/core/entities/Team';

import {
    FormBuilder,
    FormGroup,
    FormControl,
} from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AdminService } from 'app/core/services/admin/admin.service';
import { User } from 'app/core/entities/User';
import { BehaviorSubject } from 'rxjs';
import { AllTeamsCountRequest } from 'app/core/entities/responses/AllTeamsCountRequest ';
import { SessionService } from 'app/core/auth/Session/session.service';


@Component({
    selector: 'example',
    templateUrl: './teamManagment.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class teamManagmentComponent {
    @ViewChild(MatSort) sort: MatSort;

    public searchTerm: string | any = null;
    public TeamColumns: string[] = [
        'teamName',
        'Description',
        'OnsiteEmployees',
        'TeamMembers',
        'Manager',
        'Edit',
    ];
    public TeamNumbers: number;

    public dataSource: MatTableDataSource<AllTeamsCountRequest> =
        new MatTableDataSource<AllTeamsCountRequest>();
    public teamsSubject: BehaviorSubject<AllTeamsCountRequest[]> =
        new BehaviorSubject<AllTeamsCountRequest[]>([]);

    public searchForm: FormGroup;
    public managers: User[] = [];


    searchControl: FormControl = new FormControl();

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private fb: FormBuilder,
        private _adminService: AdminService,
        private cdr: ChangeDetectorRef,
        private _sessionService : SessionService
    ) {        
    
    }
    

    ngOnInit(): void {

        this.getAllTeams();
        this.searchForm = this.fb.group({
            email: [''], // Email field with required and email validators
        });

        // Subscribe to search control value changes
        this.searchControl.valueChanges.subscribe((value) => {
            this.applyFilter(value);
        });

        // Custom filter predicate to filter across all columns of the team
        this.dataSource.filterPredicate = (
            data: AllTeamsCountRequest,
            filter: string
        ) => {
            const filterValue = filter.trim().toLowerCase();
            const { team } = data;
            const concatenatedTeamData =
                `${team.teamName}◬${team.description}◬${team.onsiteEmployees}◬${team.manager.fullName}`.toLowerCase();
            return concatenatedTeamData.indexOf(filterValue) !== -1;
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Form and display methods
    // -----------------------------------------------------------------------------------------------------

    updateDataList(team: any, operation: string) {
        // Get the current list of teams
        const currentTeams = this.teamsSubject.getValue();
        const index = currentTeams.findIndex(
            (t) => t.team.idTeam === team.idTeam
        );

        // Perform action based on the operation type
        switch (operation) {
            case 'edit':
                if (index !== -1) {
                    currentTeams[index].team = team;
                }
                break;

            case 'add':
                if (index === -1) {
                    currentTeams.push(new AllTeamsCountRequest(team, 0));
                }
                break;

            case 'delete':
                if (index !== -1) {
                    currentTeams.splice(index, 1);
                }
                break;

            default:
                console.warn('Unsupported operation:', operation);
                return; // Exit if operation is not recognized
        }

        // Update the BehaviorSubject and MatTableDataSource
        this.teamsSubject.next(currentTeams);
        this.dataSource.data = [...currentTeams]; // Create a new array reference to trigger change detection

        // Perform additional operations based on the action
        this.handlePostOperation(team, operation);
        this.TeamNumbers = this.dataSource.data.length;
    }

    handlePostOperation(team: any, operation: string): void {
        switch (operation) {
            case 'edit':
                this.onUpdateTeam(team);
                break;

            case 'add':
                this.onAddTeam(team);
                break;

            case 'delete':
                this.onDeleteTeam(team);
                break;

            default:
                console.warn(
                    'Unsupported operation for post-processing:',
                    operation
                );
                break;
        }

        // Refresh managers list
        this.getAllManagers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Dialog Opening methods
    // -----------------------------------------------------------------------------------------------------

    openEditDialog(team: Team): void {
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
                        this.updateDataList(result.updatedTeam, 'edit');
                    } else if (result.status === 'cancelled') {
                        console.log('Operation cancelled');
                    }
                }
            });
    }

    openAddDialog(): void {
        const managers = this.managers;
        const dialogRef2 = this._fuseConfirmationService.openAddTeam({
            managers,
        });

        dialogRef2
            .afterClosed()
            .subscribe((result: { status: string; newTeam: Team }) => {
                if (result) {
                    if (result.status === 'confirmed' && result.newTeam) {
                        this.updateDataList(result.newTeam, 'add');
                    } else if (result.status === 'cancelled') {
                        console.log('Operation cancelled');
                    }
                }
            });
    }

    openDeleteDialog(team: Team): void {
        const deleteTeamConfig = this._fuseConfirmationService._defaultConfig;
        deleteTeamConfig.message = 'Do you want to delete this Team ?';
        deleteTeamConfig.title = 'Delete Team ';
        const dialogRef2 = this._fuseConfirmationService.open(deleteTeamConfig);

        dialogRef2.afterClosed().subscribe((result: any) => {
            if (result) {
                if (result === 'confirmed') {
                    this.updateDataList(team, 'delete');
                } else if (result.status === 'cancelled') {
                    console.log('Operation cancelled');
                }
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data treatment methods
    // -----------------------------------------------------------------------------------------------------
    getAllManagers(): User[] {
        this._adminService.getAllManagers().subscribe({
            next: (data: any) => {
                this.cdr.detectChanges(); // Ensure change detection runs
                this.managers = data as User[]; // Cast the data to User[]
            },
            error: (error) => {
                console.error('Error fetching managers:', error);
            },
        });
        return this.managers;
    }

    getAllTeams(): void {
        this._adminService.getAllTeams().subscribe({
            next: (data: AllTeamsCountRequest[]) => {
                this.teamsSubject.next(data); // Update the BehaviorSubject
                this.dataSource.data = data; // Update the BehaviorSubject
                this.dataSource.sort = this.sort; //affecting the sort
                this.TeamNumbers = data.length

                this.sortMappConfig()
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
                console.error('Error adding team:', error);
            },
        });
    }

    onDeleteTeam(team: Team): void {
        this._adminService.deleteTeam(team.idTeam).subscribe({
            next: (deletedTeam) => {
                console.log('Team deleted successfully:', deletedTeam);

                // Handle the updated team, update UI or refresh data if necessary
            },
            error: (error) => {
                console.error('Error deleting team:', error);
            },
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Filter related methods
    // -----------------------------------------------------------------------------------------------------

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Sort related methods
    // -----------------------------------------------------------------------------------------------------

    sortMappConfig(){
        // Custom sorting accessor to handle nested properties
       this.dataSource.sortingDataAccessor = (item, property) => {
        switch(property) {
            case 'teamName': return item.team.teamName;
            case 'Description': return item.team.description;
            case 'OnsiteEmployees': return item.team.onsiteEmployees;
            case 'TeamMembers': return item.teamMemberCount;
            case 'Manager': return item.team.manager.fullName;
            default: return item[property];
        }
    };
    
    // Connect the sort to the dataSource
    this.dataSource.sort = this.sort;
    }
    
}
