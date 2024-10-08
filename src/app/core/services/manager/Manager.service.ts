import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'app/core/auth/Api/Apis';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { RemoteWorkRequestStatus } from 'app/core/entities/RemoteWorkRequestStatus';
import { UpdateRemoteWorkRequest } from 'app/core/entities/requests/updateRemoteWorkRequest';
import { Team } from 'app/core/entities/Team';
import { User } from 'app/core/entities/User';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ManagerService {
    private _teamUrlApi: string = environment.TeamApiUrl;
    private _userUrlApi: string = environment.UserApiUrl;

    private _remoteWorkRequestApiUrl: string =
        environment.RemoteWorkRequestApiUrl;

    constructor(private _httpClient: HttpClient) {}

    //Getting all the remote work request by managed team
    getAllRemoteWorkRequestByTeam(
        userID: number,
        statuses: String[]
    ): Observable<RemoteWorkRequest[]> {
        // Convert the statuses array to a query string
        const statusParams = statuses
            .map((status) => `statuses=${status}`)
            .join('&');
        return this._httpClient.get<RemoteWorkRequest[]>(
            `${this._remoteWorkRequestApiUrl}/getAllRemoteWorkRequestByTeam/${userID}?${statusParams}`
        );
    }

    //Approving all the remote work requests
    approveAllRemoteWorkRequest(
        userID: number
    ): Observable<RemoteWorkRequest[]> {
        return this._httpClient.post<RemoteWorkRequest[]>(
            `${this._remoteWorkRequestApiUrl}/approveAllRemoteWorkRequest/${userID}`,
            ''
        );
    }

    //Getting the team for the user
    getTeamByUser(idUser: number): Observable<Team> {
        return this._httpClient.get<Team>(
            `${this._teamUrlApi}/getTeamByUser/${idUser}`
        );
    }

    //updatin the current requests
    updateRemoteWorkRequest(
        request: UpdateRemoteWorkRequest
    ): Observable<RemoteWorkRequest> {
        return this._httpClient.post<RemoteWorkRequest>(
            `${this._remoteWorkRequestApiUrl}/updateRemoteWorkRequest`,
            request
        );
    }

    //adding a new blocked day to a team
    addBlockedDay(
        teamID: number,
        blockedDay: BlockedDay
    ): Observable<BlockedDay> {
        return this._httpClient.post<BlockedDay>(
            `${this._teamUrlApi}/addBlockedDayToTeam/${teamID}`,
            blockedDay
        );
    }

    //adding a new blocked day to a team
    removeBlockedDay(
        teamID: number,
        blockedDayID: number
    ): Observable<BlockedDay> {
        return this._httpClient.delete<BlockedDay>(
            `${this._teamUrlApi}/removeBlockedDayFromTeam/${teamID}/${blockedDayID}`
        );
    }

    //getting all the team memebers
    getTeamMembersByManager(idUser: number): Observable<User[]> {
        return this._httpClient.get<User[]>(
            `${this._teamUrlApi}/getTeamMemeberByManagers/${idUser}`
        );
    }

    //Removing a team member from the team
    removeCollaboratorFromTeam(
        idTeam: number,
        idUser: number
    ): Observable<any> {
        return this._httpClient.delete(
            `${this._teamUrlApi}/removeCollaboratorFromTeam/${idTeam}/${idUser}`
        );
    }

    //getting all the available collaborators to add for the team
    getAllAvailableCollaborators(): Observable<User[]> {
        return this._httpClient.get<User[]>(
            `${this._userUrlApi}/getAllAvailableCollaborators`
        );
    }

    //Adding a new collaborator 
    addNewCollaboratorToTeam(
        teamID: number,
        userID : number
    ): Observable<User> {
        return this._httpClient.post<User>(
            `${this._teamUrlApi}/addCollaboratorToTeam/${teamID}/${userID}`,'');
    }


}
