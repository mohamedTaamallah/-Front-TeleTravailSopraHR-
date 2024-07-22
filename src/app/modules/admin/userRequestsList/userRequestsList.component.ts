import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    ActionEventArgs,
    EditSettingsModel,
    GridComponent,
    PrintEventArgs,
} from '@syncfusion/ej2-angular-grids';
import { User } from 'app/core/entities/User';
import { AdminService } from 'app/core/services/admin/admin.service';
import { delay } from 'rxjs/operators';
import { createElement } from '@syncfusion/ej2-base';
import { AffectRoleStatusRequest } from 'app/core/entities/AffectRoleStatusRequest';

@Component({
    selector: 'example',
    templateUrl: './userRequestsList.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class userRequestsListComponent {
    public data: User[] = [];
    public filterSettings: Object;
    public toolbarOptions: string[];
    public orderidrules: Object;
    public customeridrules: Object;
    public freightrules: Object;
    public PageSettings: Object;
    public editSettings?: EditSettingsModel;
    public editparams: Object;

    @ViewChild('grid') public grid?: GridComponent;

    /**
     * Constructor
     */
    constructor(private adminService: AdminService) {}

    ngOnInit(): void {
        //getting all the pending users request
        this.getListPendingUsers();

        this.filterSettings = { type: 'Excel' };
        this.toolbarOptions = ['Search', 'Print', 'Update'];
        this.PageSettings = { pageSizes: true, pageSize: 12 };
        this.editSettings = { allowEditing: true, mode: 'Dialog' };
        this.editparams = { params: { popupHeight: '300px' } };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data treatment  methods
    // -----------------------------------------------------------------------------------------------------

    getListPendingUsers() {
        this.adminService.getPendingUsersRequests().subscribe(
            (users: User[]) => {
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
        if (args.requestType === 'save') {
            // args.data contains the updated data
            const updatedData: User = args.data as User;
            console.log('Data to be updated:', updatedData);
            const affectRoleStatusRequest = new AffectRoleStatusRequest(
                updatedData.idUser,
                updatedData.role,
                updatedData.userStatus
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
}

interface CustomElement extends Element {
    ej2_instances: any[];
}
