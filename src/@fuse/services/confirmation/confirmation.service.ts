import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { merge } from 'lodash-es';
import { FuseConfirmationDialogComponent } from '@fuse/services/confirmation/dialog/dialog.component';
import { FuseConfirmationConfig } from '@fuse/services/confirmation/confirmation.types';
import { EditTeamComponent } from 'app/modules/admin/fullTeamMangmentElements/editTeam/editTeam.component';
import { Team } from 'app/core/entities/Team';
import { User } from 'app/core/entities/User';
import { AddTeamComponent } from 'app/modules/admin/fullTeamMangmentElements/addTeam/add-team/add-team.component';
import { AddCollaboratorToTeamComponent } from 'app/modules/manager/team managment/addCollaborator/add-team/addCollaborator.component';
import { SchedulerParamaetersComponent } from 'app/modules/collaborator/SchedulerParamaeters/SchedulerParamaeters.component';
import { TeamSettingsComponent } from 'app/modules/manager/team managment/TeamSettings/TeamSettings.component';

@Injectable()
export class FuseConfirmationService
{
    public _defaultConfig: FuseConfirmationConfig = {
        title      : 'Confirm action',
        message    : 'Are you sure you want to confirm this action?',
        icon       : {
            show : true,
            name : 'heroicons_outline:exclamation',
            color: 'warn'
        },
        actions    : {
            confirm: {
                show : true,
                label: 'Approve',
                color: 'warn'
            },
            cancel : {
                show : true,
                label: 'Cancel'
            }
        },
        dismissible: false
    };

    /**
     * Confirmation dialog of the approve all remote work request
     */

    public _approveConfig: FuseConfirmationConfig = {
        title      : 'Approve all Requests',
        message    : 'Are you sure you want to approve all remote work requests ?',
        icon       : {
            show : true,
            name : 'heroicons_outline:exclamation',
            color: 'warn'
        },
        actions    : {
            confirm: {
                show : true,
                label: 'Confirm',
                color: 'warn'
            },
            cancel : {
                show : true,
                label: 'Cancel'
            }
        },
        dismissible: false
    };


    /**
     * Confirmation dialog of removing a collaborator from the team
     */

    public _removeCollaboratorConfig: FuseConfirmationConfig = {
        title      : 'Approve all Requests',
        message    : 'Are you sure you to remove collaborator from the team ?',
        icon       : {
            show : true,
            name : 'heroicons_outline:exclamation',
            color: 'warn'
        },
        actions    : {
            confirm: {
                show : true,
                label: 'Confirm',
                color: 'warn'
            },
            cancel : {
                show : true,
                label: 'Cancel'
            }
        },
        dismissible: false
    };

    /**
     * Edit Team dialog config
     */

    private _editTeamConfig: FuseConfirmationConfig = {

        actions    : {
            confirm: {
                show : true,
                label: 'Confirm',
                color: 'primary'
            },
            cancel : {
                show : true,
                label: 'Cancel'
            }
        },
        dismissible: false
    };


    /**
     * Add Collaborator to team 
     */
    private _addCollaboratorToTeamConfig: FuseConfirmationConfig = {

    actions    : {
        confirm: {
            show : true,
            label: 'Confirm',
            color: 'primary'
        },
        cancel : {
            show : true,
            label: 'Cancel'
        }
    },
    dismissible: false
};

    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    open(config: FuseConfirmationConfig = {}): MatDialogRef<FuseConfirmationDialogComponent>
    {
        // Merge the user config with the default config
        const userConfig = merge({}, this._defaultConfig, config);

        // Open the dialog
        return this._matDialog.open(FuseConfirmationDialogComponent, {
            autoFocus   : false,
            disableClose: !userConfig.dismissible,
            data        : userConfig,
            panelClass  : 'fuse-confirmation-dialog-panel'
        });
    }
    
    openEditTeam(data: { team: Team, managers: User[]}): MatDialogRef<EditTeamComponent>
    {
        // Merge the user config with the default config
        const userConfig = merge({}, this._editTeamConfig,data);

        // Open the dialog
        return this._matDialog.open(EditTeamComponent, {
            autoFocus   : false,
            disableClose: !userConfig.dismissible,
            data        : userConfig,
            panelClass  : 'fuse-confirmation-dialog-panel'
        });
    }

    openAddTeam(data:{ managers: User[]}): MatDialogRef<AddTeamComponent>
    {
        // Merge the user config with the default config
        const userConfig = merge({}, this._editTeamConfig,data);

        // Open the dialog
        return this._matDialog.open(AddTeamComponent, {
            autoFocus   : false,
            disableClose: !userConfig.dismissible,
            data        : userConfig,
            panelClass  : 'fuse-confirmation-dialog-panel'
        });
    }

    openAddCollaboratorToTeam(data : User[]): MatDialogRef<AddCollaboratorToTeamComponent>
    {
        // Merge the user config with the default config
        const userConfig = merge({}, this._editTeamConfig,data);

        // Open the dialog
        return this._matDialog.open(AddCollaboratorToTeamComponent, {
            autoFocus   : false,
            disableClose: !userConfig.dismissible,
            data        : userConfig,
            panelClass  : 'fuse-confirmation-dialog-panel'
        });
    }

    openSchedulerParameters(data:{ userInformations: User}): MatDialogRef<SchedulerParamaetersComponent>
    {
        // Merge the user config with the default config
        const userConfig = merge({}, this._editTeamConfig,data);

        // Open the dialog
        return this._matDialog.open(SchedulerParamaetersComponent, {
            autoFocus   : false,
            disableClose: !userConfig.dismissible,
            data        : userConfig,
            panelClass  : 'SchedulerParamaetersComponent'
        });
    }

    openTeamSettings(data:{ userInformations: User}): MatDialogRef<TeamSettingsComponent>
    {
        // Merge the user config with the default config
        const userConfig = merge({}, this._editTeamConfig,data);

        // Open the dialog
        return this._matDialog.open(TeamSettingsComponent, {
            autoFocus   : false,
            disableClose: !userConfig.dismissible,
            data        : userConfig,
            panelClass  : 'TeamSettingsComponent'
        });
    }
}
