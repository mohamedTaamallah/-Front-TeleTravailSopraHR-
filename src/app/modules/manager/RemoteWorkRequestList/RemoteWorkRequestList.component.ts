import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseUtilsService } from '@fuse/services/utils';
import {
    EditSettingsModel,
    FilterSettingsModel,
    ToolbarItems
} from '@syncfusion/ej2-angular-grids';
import { ToolbarItemModel } from '@syncfusion/ej2-angular-schedule';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { SessionService } from 'app/core/auth/Session/session.service';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { User } from 'app/core/entities/User';
import { ManagerService } from 'app/core/services/manager/Manager.service';

@Component({
    selector: 'example',
    templateUrl: './RemoteWorkRequestList.component.html',
    styleUrls: ['./RemoteWorkList.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class RemoteWorkRequestListComponent implements OnInit {
    public data: RemoteWorkRequest[] = [];
    public filterSettings?: FilterSettingsModel;
    public toolbarOptions?: (ToolbarItems | ToolbarItemModel)[];
    public orderidrules: Object;
    public customeridrules: Object;
    public freightrules: Object;
    public PageSettings: Object;
    public editSettings?: EditSettingsModel;
    public editparams: Object;
    public teamParams: Object;
    public user: User;
    public groupOptions: Object;

    /**
     * Constructor
     */
    constructor(
        private managerService: ManagerService,
        private sessionService: SessionService,
        private fuseUtilis: FuseUtilsService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {}
    ngOnInit(): void {
        this.user = this.sessionService.getUser();

        this.getAllPendingRemoteWorkRequestByManagedTeam();

        this.editSettings = {
            allowEditing: true,
            allowAdding: true,
            allowDeleting: true,
            mode: 'Dialog',
        };
        this.toolbarOptions = [
            {
                text: 'Accept All',
                id: 'customButton',
                prefixIcon: 'e-icons e-add',
            },
            'Delete',
            'Search',
        ];
        this.filterSettings = { type: 'CheckBox' };
        this.PageSettings = { pageSizes: true, pageSize: 12 };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Utils treatment  methods
    // -----------------------------------------------------------------------------------------------------
    
    approveAllRequests(args: ClickEventArgs): void {
        if (args.item.id === 'customButton') {
          this.openAddDialog()
        }
    }
    
    openAddDialog(): void {
        const dialogRef2 = this._fuseConfirmationService.open(this._fuseConfirmationService._approveConfig);
        dialogRef2
            .afterClosed()
            .subscribe((result: any) => {
                if (result) {
                    if (result === 'confirmed') {
                            this.approveAllRemoteWorkRequest()
                    } else if (result.status === 'cancelled') {
                        console.log('Operation cancelled');
                    }
                }
            });
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
                    console.log(
                        'all the remote request related to the managed team',
                        response
                    );
                    this.data = response;
                    this.data = response.map((request) => {
                        return {
                            ...request,
                            timeRemaining:
                                this.fuseUtilis.calculateTimeRemaining(
                                    request.requestDate
                                ),
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

    //Approving all the pending remote work requests 
    approveAllRemoteWorkRequest(){
        this.managerService
        .approveAllRemoteWorkRequest(this.user.idUser)
        .subscribe({
            next: (response) => {
                console.log(
                    'all the remote request approved',
                    response
                );
                this.data = response;
                this.data = response.map((request) => {
                    return {
                        ...request,
                        timeRemaining:
                        0,
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
