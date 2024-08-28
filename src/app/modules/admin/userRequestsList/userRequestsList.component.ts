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
    public teams: string[];
    public teamParams: Object;
    public orderData: any = [];
    public teamName: string
    
    @ViewChild('grid') public grid?: GridComponent;

    /**
     * Constructor
     */
    constructor(private adminService: AdminService,private cdr: ChangeDetectorRef) {}

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
            // Capture the current value of the team before opening the dialog
            const currentRowData: UserWithTeamDTO =
                args.rowData as UserWithTeamDTO;

            // Set the team value to the current value in the table
            this.teamName = currentRowData.team?.teamName || '';
    
        // Manually trigger change detection
        this.cdr.detectChanges();


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
            this.adminService
                .affectRoleAndChangeStatus(affectRoleStatusRequest)
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

    getAllTeams(): void {
        this.adminService.getAllTeams().subscribe({
            next: (data: AllTeamsCountRequest[]) => {
                this.teams = data.map(teamData => teamData.team.teamName);
                console.log(this.teams); // Check the extracted team names

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
