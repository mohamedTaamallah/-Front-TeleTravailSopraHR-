import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { EditSettingsModel, GridComponent, PrintEventArgs, Sort } from '@syncfusion/ej2-angular-grids';
import { Team } from 'app/core/entities/Team';
import { createElement } from '@syncfusion/ej2-base';
import { SessionService } from 'app/core/auth/Session/session.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UntypedFormGroup, FormGroup, UntypedFormBuilder, FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AdminService } from 'app/core/services/admin/admin.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector     : 'example',
    templateUrl  : './teamManagment.component.html',
    encapsulation: ViewEncapsulation.None
})
export class teamManagmentComponent
{

    searchTerm: string | any = null;
    pendingUsersRequests!: User[];


    pendingUserRequestColumns: string[] = [
        'teamName',
        'Descritption',
        'OnsiteEmployees',
        'Manager',
        'Edit'


    ];
    TeamNumbers: number;

    dataSource: any;
    configForm!: UntypedFormGroup;
    emailForm: FormGroup;



    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private adminService: AdminService,
        private _liveAnnouncer: LiveAnnouncer,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private fb: FormBuilder,
        private changeDetectorRefs: ChangeDetectorRef,
        private sessionService : SessionService
    ) {}

    ngOnInit(): void {
        this.dataSource = this.sessionService.getTeams()
        this.TeamNumbers = this.dataSource.length
        this.initForm()
        this.emailForm = this.fb.group({
            email: ['',] // Email field with required and email validators
          });
    }

    initForm(): void {
        this.configForm = this._formBuilder.group({
          title: 'Reject User',
          message: 'Are you sure you want to remove this user permanently? <span class="font-medium">This action cannot be undone!</span>',
          icon: this._formBuilder.group({
            show: true,
            name: 'heroicons_outline:exclamation',
            color: 'warn'
          }),
          actions: this._formBuilder.group({
            confirm: this._formBuilder.group({
              show: true,
              label: 'Remove',
              color: 'warn'
            }),
            cancel: this._formBuilder.group({
              show: true,
              label: 'Cancel'
            })
          }),
          dismissible: true
        });
      }

    getListPendingUsers() {

    }

    updateStatus(user: any, newStatus: string): void {
    }

    onSearchChange(event: Event) {
        this.searchTerm = (event.target as HTMLInputElement).value;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }


    /** Announce the change in sort state for assistive technology. */
    announceSortChange(sortState: Sort) {
 
    }
        /**
     * Open confirmation dialog
     */
        openConfirmationDialog(user: any, newStatus: string): void
        {
            // Open the dialog and save the reference of it
            if(newStatus == "APPROVED"){
                this.configForm.get('title').setValue('Approve User')
                this.configForm.get('message').setValue('Are you sure you want to approve this user? <span class="font-medium">This action cannot be undone!</span>')
                this.configForm.get('actions.confirm.label').setValue('Approve')
                this.configForm.get('actions.confirm.color').setValue('primary')
                this.configForm.get('icon.name').setValue('heroicons_outline:question-mark-circle')
                this.configForm.get('icon.color').setValue('primary')
            }
            else{
                this.initForm()
            }

            const dialogRef = this._fuseConfirmationService.open(this.configForm.value);
            
            // Subscribe to afterClosed from the dialog reference
            dialogRef.afterClosed().subscribe((result) => {
                if(result=='confirmed'){
                    this.updateStatus(user, newStatus);
                }
            });
        }

        applyFilter(searchTerm: string): void {
            this.searchTerm = searchTerm.trim().toLowerCase();
          }
}