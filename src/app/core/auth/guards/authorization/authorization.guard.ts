import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';
import { SessionService } from '../../Session/session.service';
import { User } from 'app/core/entities/User';

@Injectable({
    providedIn: 'root',
})
export class AuthorizationGuard implements CanActivate {
    constructor(
        private sessionService: SessionService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRole = route.data.expectedRole;
        const user : User = this.sessionService.getUser();

        if (user && user.role === expectedRole) {
            return true;
        } else {
            this.router.navigate(['/error/500']);
            return false;
        }
    }
}
