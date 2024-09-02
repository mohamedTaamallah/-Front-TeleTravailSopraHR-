import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationConfig } from '@fuse/services/confirmation';
import { FuseValidators } from '@fuse/validators';
import { Team } from 'app/core/entities/Team';
import { User } from 'app/core/entities/User';
import { EditTeamComponent } from 'app/modules/admin/fullTeamMangmentElements/editTeam/editTeam.component';

@Component({
  selector: 'app-TeamSettings',
  templateUrl: './TeamSettings.component.html',
})
export class TeamSettingsComponent implements OnInit {

  public managers: User[] = [];
  public currentTeam: Team;
  public editTeamForm: FormGroup;

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<EditTeamComponent>
  ) {
      // Set up current team and managers
      this.setUpCurrentTeam(this.data);
  }

  ngOnInit(): void {
    console.log(this.currentTeam)
      // Initialize the form
      this.editTeamForm = this.fb.group({
          teamName: [
              this.currentTeam?.teamName || '',
              [
                  Validators.required,
                  Validators.minLength(3),
                  Validators.maxLength(20),
                  FuseValidators.stringInputValidator(),
              ],
          ],
          description: [
              this.currentTeam?.description || '',
              [FuseValidators.stringInputValidator()],
          ],
          teamRemoteWorkBalance: [
            this.currentTeam?.teamRemoteWorkBalance || '',
            [
                Validators.required,
            ],
        ],
        onSiteEmployees: [
            this.currentTeam?.onsiteEmployees || '',
            [
                Validators.required,
            ],
        ],
      });
  }

  setUpCurrentTeam(data: any): void {
    console.log(data)
      this.currentTeam = new Team(
          data.userInformations.managedTeam.idTeam,
          data.userInformations.managedTeam.teamName,
          data.userInformations.managedTeam.description,
          data.userInformations.managedTeam.onsiteEmployees,
          data.userInformations,
          data.userInformations.managedTeam.teamRemoteWorkBalance,
      );
  }

  onSubmit(): void {
      if (this.editTeamForm.valid) {
          const newTeam = this.editTeamForm.getRawValue();
          this.updateCurrentManager(newTeam);
      } else {
          console.log('Form invalid');
      }
  }

  hasChanges(newTeam: any): boolean {
      return (
          this.currentTeam.teamName !== newTeam.teamName ||
          this.currentTeam.description !== newTeam.description ||
          this.currentTeam.teamRemoteWorkBalance !== newTeam.teamRemoteWorkBalance
      );
  }

  updateCurrentManager(newTeam: any) {
      if (this.hasChanges(newTeam)) {
          //checking if we need to affect the current manager to the new one if its empty
          this.currentTeam.teamName = newTeam.teamName;
          this.currentTeam.description = newTeam.description;
          this.currentTeam.teamRemoteWorkBalance = newTeam.teamRemoteWorkBalance
          this.currentTeam.onsiteEmployees = newTeam.onsiteEmployees
          this.dialogRef.close({
              status: 'confirmed',
              updatedTeam: this.currentTeam,
          });
      } else {
          console.log('No changes detected');
      }
  }

  onCancel(): void {
      this.dialogRef.close({
          status: 'cancelled',
      });
  }

}
