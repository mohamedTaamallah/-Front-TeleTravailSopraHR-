import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    ActionEventArgs,
    EditSettingsModel,
    GridComponent,
    PrintEventArgs,
    QueryCellInfoEventArgs,
} from '@syncfusion/ej2-angular-grids';
import { User } from 'app/core/entities/User';
import { AdminService } from 'app/core/services/admin/admin.service';
import { delay } from 'rxjs/operators';
import { createElement } from '@syncfusion/ej2-base';
import { SessionService } from 'app/core/auth/Session/session.service';
import { UserWithTeamDTO } from 'app/core/entities/responses/UserWithTeamDTO';
import { Team } from 'app/core/entities/Team';
import { AffectRoleStatusRequest } from 'app/core/entities/requests/AffectRoleStatusRequest';
import { AllTeamsCountRequest } from 'app/core/entities/responses/AllTeamsCountRequest ';
import { ManagerService } from 'app/core/services/manager/Manager.service';
import { UserStatus } from 'app/core/entities/UserStatus';
import { Role } from 'app/core/entities/Role';

@Component({
    selector: 'example',
    templateUrl: './userRequestsList.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class userRequestsListComponent {
    public data: UserWithTeamDTO[] = [];
    public filterSettings: Object;
    public toolbarOptions: string[];
    public orderidrules: Object;
    public customeridrules: Object;
    public freightrules: Object;
    public PageSettings: Object;
    public editSettings?: EditSettingsModel;
    public editparams: Object;
    public teams: Team[];
    public teamParams: Object;
    public orderData: any = [];
    public teamName: string;
    public selectedTeamId: any;

    public updatedRole: Role;

    public isTeamDropdownEnabled: boolean = true;

    
    @ViewChild('grid') public grid?: GridComponent;

    /**
     * Constructor
     */
    constructor(private adminService: AdminService,private managerService : ManagerService) {}

    ngOnInit(): void {
        //getting all the pending users request
        this.getListPendingUsers();

        this.filterSettings = { type: 'Excel' };
        this.toolbarOptions = ['Search', 'Print', 'Update'];
        this.PageSettings = { pageSizes: true, pageSize: 12 };
        this.editSettings = { allowEditing: true, mode: 'Dialog' };
        this.editparams = { params: { popupHeight: '300px' } }

        this.getAllTeams()
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data treatment  methods
    // -----------------------------------------------------------------------------------------------------

    getListPendingUsers() {
        this.adminService.getPendingUsersRequests().subscribe(
            (users: UserWithTeamDTO[]) => {
                this.data = users;
            },
            (error) => {
                // Handle error, e.g., log it or show a user-friendly message
                console.error('Error fetching pending users:', error);
            }
        );
    }

    // this method handle the update for each user changed
    onActionBegin(args: ActionEventArgs) {
        if (args.requestType === 'beginEdit' || args.requestType === 'add') {
            this.orderData = Object.assign({}, args.rowData);
        // Lock the dropdown if the role is manager or if the role is changing
        this.isTeamDropdownEnabled = this.orderData.user.role !== Role.MANAGER;
        }
        if (args.requestType === 'save') {
            // args.data contains the updated data
            const updatedData: UserWithTeamDTO = args.data as UserWithTeamDTO;
            console.log('Data to be updated:', updatedData.user);
            const user: User = updatedData.user;
            

            const affectRoleStatusRequest = new AffectRoleStatusRequest(
                user.idUser,
                user.role,
                user.userStatus
            );

            if(this.selectedTeamId != null){
                this.addCollaboratorToTeam(this.selectedTeamId.id,user.idUser)
            }

            this.AffectRolesAndStatus(affectRoleStatusRequest)

            if (this.selectedTeamId != null) {
                this.addCollaboratorToTeam(this.selectedTeamId.id, user.idUser);
            }
    
            this.AffectRolesAndStatus(affectRoleStatusRequest);
    
            // Update the data source
            const index = this.data.findIndex(item => item.user.idUser === user.idUser);
            if (index !== -1) {
                this.data[index] = updatedData;
            }
    
            // Fetch the updated list of pending users
            this.getListPendingUsers();          
        }
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Table params  methods
    // -----------------------------------------------------------------------------------------------------

    beforePrint(e: PrintEventArgs): void {
        var rows = (this.grid as GridComponent).getSelectedRows();
        if (rows.length) {
            (e.element as CustomElement).ej2_instances[0]
                .getContent()
                .querySelector('tbody')
                .remove();
            var tbody = createElement('tbody');
            rows = [...rows];
            for (var r = 0; r < rows.length; r++) {
                tbody.appendChild(rows[r].cloneNode(true));
            }
            (e.element as CustomElement).ej2_instances[0]
                .getContentTable()
                .appendChild(tbody);
        }
    }

    onDataBound(): void {
        const gridInstance = this.grid as GridComponent;
        const dataSource = gridInstance.dataSource as UserWithTeamDTO[];
        dataSource.forEach((data: UserWithTeamDTO) => {
            if (data.user.role === 'COLLABORATOR') {
                gridInstance.hideColumns('team.teamName');
            }
        });
    }

    onTeamChange(event: any) {
        this.selectedTeamId = event.itemData;
        console.log('Selected Team ID:', this.selectedTeamId);
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Data methods treatment
    // -----------------------------------------------------------------------------------------------------

    AffectRolesAndStatus(affectRoleAndChangeStatus : AffectRoleStatusRequest){
        this.adminService
        .affectRoleAndChangeStatus(affectRoleAndChangeStatus)
        .subscribe({
            next: (response) => {
                console.log('Update successful', response);
            },
            error: (error) => {
                console.error('Error updating user:', error);
            },
            complete: () => {
                // Optional: Code to execute when the Observable completes
                console.log('Update request completed');
            },
        });
    }

    addCollaboratorToTeam(userID : number, teamId : number){
        this.managerService.addNewCollaboratorToTeam(userID,teamId)
        .subscribe({
            next: (response) => {
                console.log('Update successful', response);
            },
            error: (error) => {
                console.error('Error updating user:', error);
            },
            complete: () => {
                // Optional: Code to execute when the Observable completes
                console.log('Update request completed');
            },
        });
    }
    getAllTeams(): void {
        this.adminService.getAllTeams().subscribe({
            next: (data: AllTeamsCountRequest[]) => {
                this.teams = data.map(teamData => ({
                    id: teamData.team.idTeam,
                    teamName: teamData.team.teamName
                }));
                console.log(this.teams); // Check the extracted team names and IDs
            },
            error: (error) => {
                console.error('Error fetching teams:', error);
            },
        });
    }

}

interface CustomElement extends Element {
    ej2_instances: any[];
}
