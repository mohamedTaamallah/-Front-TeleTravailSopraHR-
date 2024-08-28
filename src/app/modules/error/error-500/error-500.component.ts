import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector       : 'error-500',
    templateUrl    : './error-500.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Error500Component
{
    /**
     * Constructor
     */
    constructor(private router: Router, private location: Location) {}

    goBack() {
      this.location.back(); // This will navigate to the previous page
    }
}
