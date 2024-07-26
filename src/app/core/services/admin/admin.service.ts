import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../auth/Api/Apis';
import { JwtTokenService } from '../../auth/JWT/jwt-token.service';
import { User } from '../../entities/User';
import { AffectRoleStatusRequest } from 'app/core/entities/AffectRoleStatusRequest';
import { UserWithTeamDTO } from 'app/core/entities/UserWithTeamDTO';
import { Team } from 'app/core/entities/Team';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient, private jwtService : JwtTokenService) { }

  private UserApiUrl: string = environment.UserApiUrl;
  private TeamApiUrl: string = environment.TeamApiUrl;


  //Getting all the users 
  getPendingUsersRequests(): Observable<UserWithTeamDTO []> {
    return this.http.get<UserWithTeamDTO []>(`${this.UserApiUrl}/getPendingUsersRequests`)
  }

  //Affect role and change status for users 
  affectRoleAndChangeStatus(affectRoleAndChangeStatus:  AffectRoleStatusRequest): Observable<User> {
    return this.http.put<User>(`${this.UserApiUrl}/affectRoleAndChangeStatus`,affectRoleAndChangeStatus)
  }

  //Getting all the available teams 
  getAllTeams(): Observable<Team []> {
    return this.http.get<Team []>(`${this.TeamApiUrl}/getAllTeams`)
  }

  //Getting all the available managers that still ain't having a team 
  getAllManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.UserApiUrl}/getAllManagers`)
  }

  updateTeam(team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.TeamApiUrl}/updateTeam`,Team)  }
}