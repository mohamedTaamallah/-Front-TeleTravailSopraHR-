import { Component, ViewEncapsulation } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    FilterSettingsModel,
    ToolbarItems,
    EditSettingsModel,
    CommandModel,
    CommandClickEventArgs,
} from '@syncfusion/ej2-angular-grids';
import { ToolbarItemModel } from '@syncfusion/ej2-angular-schedule';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { SessionService } from 'app/core/auth/Session/session.service';
import { Team } from 'app/core/entities/Team';
import { User } from 'app/core/entities/User';
import { AdminService } from 'app/core/services/admin/admin.service';
import { ManagerService } from 'app/core/services/manager/Manager.service';

@Component({
    selector: 'example',
    templateUrl: './TeamHandle.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class TeamHandleComponent {
    public user: User;
    public data: User[] = [];
    public filterSettings?: FilterSettingsModel;
    public toolbarOptions?: (ToolbarItems | ToolbarItemModel)[];
    public orderidrules: Object;
    public customeridrules: Object;
    public freightrules: Object;
    public PageSettings: Object;
    public editSettings?: EditSettingsModel;
    public commands?: CommandModel[];
    public Collaborators?: User[];

    /**
     * Constructor
     */
    constructor(
        private _managerService: ManagerService,
        private _sessionService: SessionService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _adminService : AdminService
    ) {
        this.toolbarOptions = [
            {
                text: 'Add Collaborator',
                id: 'AddCollborator',
                prefixIcon: 'e-icons e-add',
            },
            {
                text: 'Team Settings',
                id: 'TeamSettings',
                prefixIcon: 'e-icons e-page-setup',
            },
            'Search',
        ];

        this.PageSettings = { pageSizes: true, pageSize: 12 };
        this.user = this._sessionService.getUser();
        this.filterSettings = { type: 'CheckBox' };

        this.getTeamMembersByManager();
        this.getAllAvailableCollaborators();

        this.commands = [
            {
                type: 'Delete',
                buttonOption: {
                    cssClass: 'e-flat',
                    iconCss: 'e-delete e-icons',
                },
            },
            {
                type: 'Cancel',
                buttonOption: {
                    cssClass: 'e-flat',
                    iconCss: 'e-cancel-icon e-icons',
                },
            },
        ];
        console.log(this.data);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Schedule treatment  methods
    // -----------------------------------------------------------------------------------------------------

    imageSrc(): string {
        if (
            document.body.classList.value.indexOf('dark') > -1 ||
            document.body.classList.value.indexOf('highcontrast') > -1
        ) {
            return 'assets/images/logo/emptyRecordTemplate_light.svg';
        } else {
            return 'assets/images/logo/emptyRecordTemplate_light.svg';
        }
    }

    commandClick(args: CommandClickEventArgs): void {
        const rowData: any = args.rowData;
        if (rowData) {
            this.openConfDialog(rowData.idUser);
        }
    }

    HandleToolButtons(args: ClickEventArgs): void {
        if (args.item.id === 'AddCollborator') {
            this.openAddDialog();
        }
        else{
            this.openTeamSettings()
        }
    }

    //confirmation for accepting all the remote work Requests
    openConfDialog(userID: number): void {
        const dialogRef2 = this._fuseConfirmationService.open(
            this._fuseConfirmationService._approveConfig
        );
        dialogRef2.afterClosed().subscribe((result: any) => {
            if (result) {
                if (result === 'confirmed') {
                    this.onRemoveCollaborator(userID);
                } else if (result.status === 'cancelled') {
                    console.log('Operation cancelled');
                }
            }
        });
    }

    openAddDialog(): void {
        const dialogRef2 =
            this._fuseConfirmationService.openAddCollaboratorToTeam(
                this.Collaborators
            );
        dialogRef2
            .afterClosed()
            .subscribe(
                (result: { status: string; selectedCollaborator: any }) => {
                    if (result) {

                        if (result.status === 'confirmed') {
                            this.onAddNewCollaborator(
                                result.selectedCollaborator.idUser
                            );
                        } else if (result.status === 'cancelled') {
                            console.log('Operation cancelled');
                        }
                    }
                }
            );
    }

    openTeamSettings(): void {
        const dialogRef2 =
            this._fuseConfirmationService.openTeamSettings(
                {userInformations : this.user,teamMemebersCount : this.data.length}
            );
        dialogRef2
            .afterClosed()
            .subscribe(
                (result: { status: string; updatedTeam: any }) => {
                    if (result) {
                        if (result.status === 'confirmed') {
                            console.log(result)
                            this.onUpdateTeam(result.updatedTeam)
                        } else if (result.status === 'cancelled') {
                            console.log('Operation cancelled');
                        }
                    }
                }
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data treatment  methods
    // -----------------------------------------------------------------------------------------------------

    //getting all team members
    getTeamMembersByManager() {
        this._managerService
            .getTeamMembersByManager(this.user.managedTeam.idTeam)
            .subscribe({
                next: (response) => {
                    console.log('all the team memebers are :', response);
                    this.data = response;
                    this.getAllAvailableCollaborators()
                },
                error: (error) => {
                    console.error('Error getting all the team members:', error);
                },
                complete: () => {
                    // Optional: Code to execute when the Observable completes
                    console.log('Get all team members completed');
                },
            });
    }

    //Removing a collaborator from team
    onRemoveCollaborator(idUser: number): void {
        this._managerService
            .removeCollaboratorFromTeam(this.user.managedTeam.idTeam, idUser)
            .subscribe({
                next: (response) => {
                    console.log('Collaborator removed successfully:', response);
                    // Remove the user from the data array
                    this.data = this.data.filter(
                        (user) => user.idUser !== idUser
                    );
                    this.getAllAvailableCollaborators()
                },
                error: (error) => {
                    console.error('Error removing collaborator:', error);
                },
            });
    }

    getAllAvailableCollaborators() : any{
        this._managerService.getAllAvailableCollaborators().subscribe({
            next: (response) => {
                console.log('all the available collaborators  are :', response);
                this.Collaborators = response;
                return response
            },
            error: (error) => {
                console.error(
                    'Error getting all available collaborators:',
                    error
                );
            },
            complete: () => {
                // Optional: Code to execute when the Observable completes
                console.log('Get all colloaborators is complete');
            },
        });
    }

    onAddNewCollaborator(userID: number) {
        this._managerService
            .addNewCollaboratorToTeam(this.user.managedTeam.idTeam, userID)
            .subscribe({
                next: (response) => {
                    console.log('The new Collaborator is :', response);
                    // Assuming 'response' contains the added collaborator details, push it to the 'data' array.
                    this.data.push(response);

                    // If your table or grid does not automatically refresh, you may need to manually trigger a refresh or reassign the data array.
                    this.data = [...this.data]; // Trigger change detection if needed.
                    this.getAllAvailableCollaborators()

                },
                error: (error) => {
                    console.error(
                        'Error getting adding a new collaborator:',
                        error
                    );
                },
                complete: () => {
                    // Optional: Code to execute when the Observable completes
                    console.log('Adding a collaborator is complete');
                },
            });
    }

    onUpdateTeam(team: Team): void {
        this._adminService.updateTeam(team).subscribe({
            next: (updatedTeam) => {
                console.log('Team updated successfully:', updatedTeam);
                // Handle the updated team, update UI or refresh data if necessary
                this.user.managedTeam = updatedTeam
            },
            error: (error) => {
                console.error('Error updating team:', error);
            },
        });
    }
}
