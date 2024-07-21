import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { GridComponent, PrintEventArgs } from '@syncfusion/ej2-angular-grids';
import { User } from 'app/core/entities/User';
import { AdminService } from 'app/core/services/admin.service';
import { delay } from 'rxjs/operators';
import { createElement } from '@syncfusion/ej2-base';


@Component({
    selector     : 'example',
    templateUrl  : './userRequestsList.component.html',
    encapsulation: ViewEncapsulation.None,

})
export class userRequestsListComponent
{
    public data: User[] = [];
    public filterSettings: Object;
    public toolbarOptions: string[];
    public editSettings: Object;
    public orderidrules: Object;
    public customeridrules: Object;
    public freightrules: Object;
    public PageSettings : Object

    @ViewChild('grid') public grid?: GridComponent;

    /**
     * Constructor
     */
    constructor(private adminService: AdminService)
    {
    }

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

    ngOnInit(): void {
        //getting all the pending users request 
        this.getListPendingUsers()
        
        this.filterSettings = { type: 'Excel' };
        this.toolbarOptions = ['Search','Print'];
        this.PageSettings = { pageSizes: true, pageSize: 12 };


    }

    beforePrint(e: PrintEventArgs): void {
        var rows = (this.grid as GridComponent).getSelectedRows();
        if (rows.length) {
            (e.element as CustomElement).ej2_instances[0].getContent().querySelector('tbody').remove();
            var tbody = createElement('tbody');
            rows = [...rows];
            for (var r = 0; r < rows.length; r++) {
                tbody.appendChild(rows[r].cloneNode(true));
            }
            (e.element as CustomElement).ej2_instances[0].getContentTable().appendChild(tbody);
        }
    }
    


}

interface CustomElement extends Element {
    ej2_instances: any[];
}
