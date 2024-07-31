import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'app/core/auth/Api/Apis';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { Team } from 'app/core/entities/Team';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CollaboratorService {
    constructor(private _httpClient: HttpClient) {}

    private _teamApiUrl: string = environment.TeamApiUrl;
    private _remoteWorkRequestApiUrl: string = environment.RemoteWorkRequestApiUrl;

    //Getting all the users
    getAllBlockedDaysByTeam(idTeam: number): Observable<BlockedDay[]> {
        return this._httpClient.get<BlockedDay[]>(
            `${this._teamApiUrl}/getAllBlockedDays/${idTeam}`
        );
    }

    //Getting the team for the user 
    getTeamByUser(idUser: number): Observable<Team> {
        return this._httpClient.get<Team>(
            `${this._teamApiUrl}/getTeamByUser/${idUser}`
        );
    }

    //Getting the remote work for the user 
    getRemoteWorkRequestByUser(idUser: number){
      return this._httpClient.get< RemoteWorkRequest[]>(
        `${this._remoteWorkRequestApiUrl}/getAllRemoteWorkRequestByUser/${idUser}`
    );
    }

    //Canceling the remote work request 
    cancelRemoteWorkRequest(remoteWorkRequestID: number): Observable<RemoteWorkRequest> {
      return this._httpClient.post<RemoteWorkRequest>(`${this._remoteWorkRequestApiUrl}/cancelRemoteWorkRequest/${remoteWorkRequestID}`, {});
    }
}
