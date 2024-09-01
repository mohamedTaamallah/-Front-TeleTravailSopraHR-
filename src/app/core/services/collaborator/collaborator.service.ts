import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'app/core/auth/Api/Apis';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { UpdateRemoteWorkRequest } from 'app/core/entities/requests/updateRemoteWorkRequest';
import { StudySchedule } from 'app/core/entities/StudySchedule';
import { Team } from 'app/core/entities/Team';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CollaboratorService {
    constructor(private _httpClient: HttpClient) {}

    private _teamApiUrl: string = environment.TeamApiUrl;
    private _remoteWorkRequestApiUrl: string = environment.RemoteWorkRequestApiUrl;
    private _userApiUrl: string = environment.UserApiUrl;

    //Getting all the users
    getAllBlockedDaysByTeam(idTeam: number): Observable<BlockedDay[]> {
        return this._httpClient.get<BlockedDay[]>(
            `${this._teamApiUrl}/getAllBlockedDays/${idTeam}`
        );
    }

    //Getting the remote work for the user
    getRemoteWorkRequestByUser(idUser: number) {
        return this._httpClient.get<RemoteWorkRequest[]>(
            `${this._remoteWorkRequestApiUrl}/getAllRemoteWorkRequestByUser/${idUser}`
        );
    }

    //Adding a new Remote Rquest 
    addRemoteWorkRequest(idUser :number, remoteWorkRequest : RemoteWorkRequest): Observable<RemoteWorkRequest> {
        return this._httpClient.post<RemoteWorkRequest>(`${this._remoteWorkRequestApiUrl}/addRemoteWorkRequest/${idUser}`, remoteWorkRequest);
    }

    //Updating a new Team
    updateRemoteWorkRequest(updateRemoteWorkRequest : UpdateRemoteWorkRequest): Observable<RemoteWorkRequest> {
        return this._httpClient.post<RemoteWorkRequest>(`${this._remoteWorkRequestApiUrl}/updateRemoteWorkRequest/`, updateRemoteWorkRequest);
    }

    //Canceling the remote work request
    cancelRemoteWorkRequest(remoteWorkRequestID: number): Observable<RemoteWorkRequest> {
        return this._httpClient.post<RemoteWorkRequest>(
            `${this._remoteWorkRequestApiUrl}/cancelRemoteWorkRequest/${remoteWorkRequestID}`,{});
    }

     //Adding a new Remote Rquest 
    validateRemoteWorkRequest(remoteWorkRequest : RemoteWorkRequest): Observable<RemoteWorkRequest> {
        return this._httpClient.post<RemoteWorkRequest>(`${this._remoteWorkRequestApiUrl}/validateRemoteWorkRequest`, remoteWorkRequest);
    }

    //Adding a new Remote Rquest 
    updateCollaboratorAlternateStatus(userId: number, isAlternate: boolean, studySchedule : StudySchedule): Observable<void> {
        return this._httpClient.post<void>(`${this._userApiUrl}/updateUserAlternateStatus/${userId}/${isAlternate}`, studySchedule);
      }

}
