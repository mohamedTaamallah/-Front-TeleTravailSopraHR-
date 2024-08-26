import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseConfirmationConfig } from '@fuse/services/confirmation';

@Component({
  selector: 'app-AddColaborator',
  templateUrl: './AddColaborator.component.html',
})
export class AddColaboratorComponent implements OnInit {

  constructor( @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
) { }
  ngOnInit() {
    
  }

  

}
