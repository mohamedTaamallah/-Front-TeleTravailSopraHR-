import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { EditSettingsModel, GridComponent, PrintEventArgs } from '@syncfusion/ej2-angular-grids';
import { Team } from 'app/core/entities/Team';
import { createElement } from '@syncfusion/ej2-base';

@Component({
    selector     : 'example',
    templateUrl  : './teamManagment.component.html',
    encapsulation: ViewEncapsulation.None
})
export class teamManagmentComponent
{


    public data: Team[] = [];
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
    constructor()
    {
    }

    ngOnInit(): void {
        //getting all the Teams
        //this.getListPendingUsers();

        this.filterSettings = { type: 'Excel' };
        this.toolbarOptions = ['Search', 'Print', 'Update'];
        this.PageSettings = { pageSizes: true, pageSize: 12 };
        this.editSettings = { allowEditing: true, mode: 'Dialog' };
        this.editparams = { params: { popupHeight: '300px' } };
    }

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