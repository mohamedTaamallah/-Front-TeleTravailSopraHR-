import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FuseUtilsService } from '@fuse/services/utils';
import { EditSettingsModel, FilterSettingsModel } from '@syncfusion/ej2-angular-grids';
import { SessionService } from 'app/core/auth/Session/session.service';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { UserWithTeamDTO } from 'app/core/entities/responses/UserWithTeamDTO';
import { User } from 'app/core/entities/User';
import { CollaboratorService } from 'app/core/services/collaborator/collaborator.service';
import { ManagerService } from 'app/core/services/manager/Manager.service';

@Component({
    selector     : 'example',
    templateUrl  : './RemoteWorkRequestList.component.html',
    styleUrls: ["./RemoteWorkList.scss"],
    encapsulation: ViewEncapsulation.None
})
export class RemoteWorkRequestListComponent implements OnInit
{


    public data: RemoteWorkRequest[] = [];
    public filterSettings?: FilterSettingsModel;
    public toolbarOptions: string[];
    public orderidrules: Object;
    public customeridrules: Object;
    public freightrules: Object;
    public PageSettings: Object;
    public editSettings?: EditSettingsModel;
    public editparams: Object;
    public teamParams: Object;
    public user : User
    public groupOptions: Object 
    public toolbar: string[];


    /**
     * Constructor
     */
    constructor(private managerService : ManagerService, private sessionService : SessionService, private fuseUtilis : FuseUtilsService)
    {}
    ngOnInit(): void {
        
        this.user = this.sessionService.getUser()

        this.getAllPendingRemoteWorkRequestByManagedTeam()

        this.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Dialog' };
        this.toolbar = ['Add', 'Edit', 'Delete'];
        this.filterSettings = { type: 'CheckBox' };

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data treatment  methods
    // -----------------------------------------------------------------------------------------------------
    
    //getting all the remote work requests related to the managed team 
    getAllPendingRemoteWorkRequestByManagedTeam() {
        this.managerService
        .getAllRemoteWorkRequestByTeam(this.user.idUser)
        .subscribe({
            next: (response) => {
                console.log('all the remote request related to the managed team', response);
                this.data = response
                this.data = response.map(request => {
                        return {
                            ...request,
                            timeRemaining: this.fuseUtilis.calculateTimeRemaining(request.requestDate)
                        };
                    });
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
