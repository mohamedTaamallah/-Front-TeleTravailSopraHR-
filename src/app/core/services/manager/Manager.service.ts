import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'app/core/auth/Api/Apis';
import { RemoteWorkRequest } from 'app/core/entities/RemoteWorkRequest';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  private _teamUrlApi : string  = environment.TeamApiUrl
  private _RemoteWorkRequestApiUrl : string  = environment.RemoteWorkRequestApiUrl

  constructor(private _httpClient: HttpClient) {}

    //Getting all the remote work request by managed team 
    getAllRemoteWorkRequestByTeam(userID: number): Observable<RemoteWorkRequest[]> {
      return this._httpClient.get<RemoteWorkRequest[]>(
          `${this._RemoteWorkRequestApiUrl}/getAllRemoteWorkRequestByTeam/${userID}`
      );
  }



}