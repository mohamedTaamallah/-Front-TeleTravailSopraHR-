import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { User } from '../entities/User';
import { SessionService } from '../auth/Session/session.service';
import { AuthUtils } from '../auth/auth.utils';
import { JwtTokenService } from '../auth/JWT/jwt-token.service';
import { environment } from '../auth/Api/Apis';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _userApiUrl: string = environment.UserApiUrl;

    /**
     * Constructor
     */
    constructor(        private _httpClient: HttpClient,
        private _jwtService:JwtTokenService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<any>
    {
        const email = AuthUtils._decodeToken(this._jwtService.getToken()).sub

        return this._httpClient.get<any>(`${this._userApiUrl}/getUserInformationByLoggedEmail/${email}`).pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
