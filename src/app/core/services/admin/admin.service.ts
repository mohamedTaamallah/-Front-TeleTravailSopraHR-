import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../auth/Api/Apis';
import { User } from '../../entities/User';
import { UserWithTeamDTO } from 'app/core/entities/responses/UserWithTeamDTO';
import { Team } from 'app/core/entities/Team';
import { AffectRoleStatusRequest } from 'app/core/entities/requests/AffectRoleStatusRequest';
import { AllTeamsCountRequest } from 'app/core/entities/responses/AllTeamsCountRequest ';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

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
  getAllTeams(): Observable<AllTeamsCountRequest []> {
    return this.http.get<AllTeamsCountRequest []>(`${this.TeamApiUrl}/getAllTeams`)
  }

  //Getting all the available managers that still ain't having a team 
  getAllManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.UserApiUrl}/getAllManagers`)
  }

  //Updating an existing team and affecting a manager
  updateTeam(team: Team): Observable<Team> {
    const idManager = team.manager.idUser;
    return this.http.put<Team>(`${this.TeamApiUrl}/updateTeam/${idManager}`, team);
  }

   //Adding a new Team 
  createTeam(team: Team): Observable<Team> {
    return this.http.post<Team>(`${this.TeamApiUrl}/createTeam`, team);
  }

  //Delete a  Team 
  deleteTeam(idTeam: number): Observable<Team> {
    return this.http.delete<Team>(`${this.TeamApiUrl}/deleteTeam/${idTeam}`);
  }
}