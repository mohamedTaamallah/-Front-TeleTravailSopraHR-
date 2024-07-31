import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'app/core/auth/Api/Apis';
import { BlockedDay } from 'app/core/entities/BlockedDay ';
import { Team } from 'app/core/entities/Team';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CollaboratorService {
    constructor(private _httpClient : HttpClient) {}

    private TeamApiUrl: string = environment.TeamApiUrl;
    private _teamApiUrl: string = environment.TeamApiUrl;

    //Getting all the users
    getAllBlockedDaysByTeam(idTeam : number ): Observable<BlockedDay []> {
      return this._httpClient.get<BlockedDay []>(`${this.TeamApiUrl}/getAllBlockedDays/${idTeam}`);
    }

    getTeamByUser(idUser: number): Observable<Team> {
      return this._httpClient.get<Team>(
          `${this._teamApiUrl}/getTeamByUser/${idUser}`
      );
  }
}
