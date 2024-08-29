import { Component, OnInit } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-SchedulerParamaeters',
  templateUrl: './SchedulerParamaeters.component.html',
  styleUrls: ['./SchedulerParamaeters.component.css']
})
export class SchedulerParamaetersComponent implements OnInit {

  constructor(private _fuseConfirmationService : FuseConfirmationService) { }

  ngOnInit() {

    
  }

  openEditDialog(): void {

    const dialogRef2 = this._fuseConfirmationService.openSchedulerParameters();

    dialogRef2
        .afterClosed()
        .subscribe(() => {
            if (result) {
                if (result.status === 'confirmed' && result.updatedTeam) {
                    this.updateDataList(result.updatedTeam, 'edit');
                } else if (result.status === 'cancelled') {
                    console.log('Operation cancelled');
                }
            }
        });
}

}
